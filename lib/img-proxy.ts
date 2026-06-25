import { lookup } from 'node:dns/promises';
import { ApiError } from '@/lib/api';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const TIMEOUT_MS = 10_000;

/** True for IPv4 addresses inside private / reserved ranges. */
export function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true; // this-host, private, loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // private 172.16/12
  if (a === 192 && b === 168) return true; // private 192.168/16
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmark
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

/** True for any IP (v4 or v6) we must never proxy to. */
export function isPrivateIp(ip: string): boolean {
  const addr = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (addr.includes('.') && !addr.includes(':')) {
    return isPrivateIpv4(addr);
  }
  // IPv6
  if (addr === '::1' || addr === '::') return true;
  const mapped = addr.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped && mapped[1]) return isPrivateIpv4(mapped[1]);
  const head = addr.split(':')[0] ?? '';
  if (/^f[cd]/.test(head)) return true; // fc00::/7 unique-local
  if (/^fe[89ab]/.test(head)) return true; // fe80::/10 link-local
  if (/^ff/.test(head)) return true; // ff00::/8 multicast
  return false;
}

/** Hostnames we reject before any DNS lookup. */
export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host === 'metadata.google.internal') return true;
  // IP literal? validate directly.
  if (/^[0-9.]+$/.test(host) || host.includes(':')) {
    return isPrivateIp(host);
  }
  return false;
}

/** Parse + validate the requested URL is a public http/https target. */
export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiError('VALIDATION', 'Invalid image URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ApiError('VALIDATION', 'Only http and https URLs are allowed');
  }
  if (isBlockedHostname(url.hostname)) {
    throw new ApiError('FORBIDDEN', 'That host is not allowed');
  }
  return url;
}

export interface ProxiedImage {
  data: Buffer;
  contentType: string;
}

/**
 * Fetches a custom poster URL with SSRF protections: blocks private/reserved
 * targets (pre- and post-DNS), refuses redirects, caps at 5MB / 10s, and only
 * accepts image content types.
 */
export async function proxyImage(raw: string): Promise<ProxiedImage> {
  const url = assertSafeUrl(raw);

  // Resolve and re-check every address the hostname maps to.
  let resolved: { address: string }[];
  try {
    resolved = await lookup(url.hostname, { all: true });
  } catch {
    throw new ApiError('UPSTREAM', 'Could not resolve image host');
  }
  if (resolved.length === 0 || resolved.some((r) => isPrivateIp(r.address))) {
    throw new ApiError('FORBIDDEN', 'That host is not allowed');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'error', // never follow redirects (could land on a private IP)
      headers: { accept: 'image/*' },
    });

    if (!res.ok) {
      throw new ApiError('UPSTREAM', `Image fetch failed (${res.status})`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw new ApiError('VALIDATION', 'URL did not return an image');
    }

    const declared = Number(res.headers.get('content-length') ?? '0');
    if (declared > MAX_IMAGE_BYTES) {
      throw new ApiError('VALIDATION', 'Image is too large');
    }

    if (!res.body) {
      throw new ApiError('UPSTREAM', 'Empty image response');
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_IMAGE_BYTES) {
          await reader.cancel();
          throw new ApiError('VALIDATION', 'Image is too large');
        }
        chunks.push(value);
      }
    }

    return {
      data: Buffer.concat(chunks.map((c) => Buffer.from(c))),
      contentType: contentType.split(';')[0] ?? 'image/jpeg',
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('UPSTREAM', 'Image request timed out');
    }
    throw new ApiError('UPSTREAM', 'Could not fetch the image');
  } finally {
    clearTimeout(timer);
  }
}

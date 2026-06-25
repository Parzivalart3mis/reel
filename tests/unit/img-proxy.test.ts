import { describe, expect, it } from 'vitest';
import {
  assertSafeUrl,
  isBlockedHostname,
  isPrivateIp,
  isPrivateIpv4,
} from '@/lib/img-proxy';
import { ApiError } from '@/lib/api';

describe('isPrivateIpv4', () => {
  it.each([
    '10.0.0.1',
    '10.255.255.255',
    '127.0.0.1',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.1.1',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '255.255.255.255',
  ])('flags %s as private', (ip) => {
    expect(isPrivateIpv4(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '172.15.0.1', '172.32.0.1', '192.169.0.1'])(
    'allows public %s',
    (ip) => {
      expect(isPrivateIpv4(ip)).toBe(false);
    },
  );
});

describe('isPrivateIp (IPv6)', () => {
  it.each([
    '::1',
    '::',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '::ffff:10.0.0.1',
    'ff02::1',
  ])('flags %s as private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it('allows a public IPv6', () => {
    expect(isPrivateIp('2606:4700:4700::1111')).toBe(false);
  });

  it('allows an IPv4-mapped public address', () => {
    expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
  });
});

describe('isBlockedHostname', () => {
  it.each([
    'localhost',
    'app.localhost',
    'foo.local',
    'metadata.google.internal',
    'service.internal',
    '127.0.0.1',
    '192.168.0.5',
  ])('blocks %s', (host) => {
    expect(isBlockedHostname(host)).toBe(true);
  });

  it('allows a normal CDN host', () => {
    expect(isBlockedHostname('image.tmdb.org')).toBe(false);
    expect(isBlockedHostname('cdn.example.com')).toBe(false);
  });
});

describe('assertSafeUrl', () => {
  it('accepts a public https URL', () => {
    expect(() => assertSafeUrl('https://image.tmdb.org/x.jpg')).not.toThrow();
  });

  it('rejects non-http protocols', () => {
    expect(() => assertSafeUrl('ftp://example.com/x')).toThrow(ApiError);
    expect(() => assertSafeUrl('file:///etc/passwd')).toThrow(ApiError);
  });

  it('rejects private literal hosts', () => {
    expect(() => assertSafeUrl('http://127.0.0.1/x')).toThrow(ApiError);
    expect(() => assertSafeUrl('http://169.254.169.254/latest')).toThrow(
      ApiError,
    );
  });

  it('rejects garbage', () => {
    expect(() => assertSafeUrl('not a url')).toThrow(ApiError);
  });
});

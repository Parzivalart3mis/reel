/**
 * Generates the full Reel icon set from a single vector source.
 *
 * Concept: a minimal film clapperboard (rounded slate + hinged striped top bar)
 * with a five-pointed star in the lower-right. Two-color, flat, no gradients.
 *
 *   pnpm icons
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCENT = '#6D28D9';
const CREAM = '#FAF8F4';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICONS = join(ROOT, 'public', 'icons');

interface MarkOptions {
  /** Canvas background. */
  bg: string;
  /** Clapperboard + star fill. */
  fg: string;
  /** Stripes + star "cut-out" colour (usually equals bg). */
  detail: string;
  /** Corner radius of the canvas (0 = square, for maskable full-bleed). */
  radius?: number;
}

/** Diagonal cream stripes across the hinged top bar. */
function stripes(detail: string): string {
  const out: string[] = [];
  const slant = 34;
  const top = 118;
  const bottom = 178;
  for (let x0 = 40; x0 <= 380; x0 += 64) {
    const w = 32;
    out.push(
      `<polygon points="${x0},${bottom} ${x0 + w},${bottom} ${
        x0 + w + slant
      },${top} ${x0 + slant},${top}" fill="${detail}" />`,
    );
  }
  return out.join('');
}

const STAR =
  'M346,304 L356,332.25 L385.95,333.02 L362.17,351.25 L370.69,379.98 ' +
  'L346,363 L321.31,379.98 L329.83,351.25 L306.05,333.02 L336,332.25 Z';

function clapperSvg({ bg, fg, detail, radius = 0 }: MarkOptions): string {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${radius}" fill="${bg}" />
  <!-- slate body -->
  <rect x="112" y="192" width="288" height="208" rx="22" fill="${fg}" />
  <!-- hinged top bar with diagonal stripes -->
  <clipPath id="bar"><rect x="104" y="118" width="304" height="60" rx="14" /></clipPath>
  <g clip-path="url(#bar)">
    <rect x="104" y="118" width="304" height="60" fill="${fg}" />
    ${stripes(detail)}
  </g>
  <!-- star -->
  <path d="${STAR}" fill="${detail}" />
</svg>`;
}

async function emitPng(svg: string, size: number, file: string) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(join(ICONS, file), png);
  return { size, data: png };
}

function pngToIco(entries: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  const blobs: Buffer[] = [];

  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0);
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1);
    dir.writeUInt8(0, b + 2);
    dir.writeUInt8(0, b + 3);
    dir.writeUInt16LE(1, b + 4);
    dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(e.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += e.data.length;
    blobs.push(e.data);
  });

  return Buffer.concat([header, dir, ...blobs]);
}

async function main() {
  await mkdir(ICONS, { recursive: true });

  const standard = clapperSvg({
    bg: CREAM,
    fg: ACCENT,
    detail: CREAM,
    radius: 80,
  });
  const standardSquare = clapperSvg({
    bg: CREAM,
    fg: ACCENT,
    detail: CREAM,
    radius: 0,
  });
  const maskable = clapperSvg({
    bg: ACCENT,
    fg: CREAM,
    detail: ACCENT,
    radius: 0,
  });

  // Vector source + primary favicon.
  await writeFile(join(ICONS, 'icon.svg'), standard);

  await emitPng(standard, 192, 'icon-192.png');
  await emitPng(standard, 512, 'icon-512.png');
  await emitPng(maskable, 512, 'icon-maskable-512.png');
  await emitPng(standard, 180, 'apple-touch-icon.png');

  const ico16 = await emitPng(standardSquare, 16, 'favicon-16.png');
  const ico32 = await emitPng(standardSquare, 32, 'favicon-32.png');
  const ico48 = await emitPng(standardSquare, 48, 'favicon-48.png');
  await writeFile(join(ICONS, 'favicon.ico'), pngToIco([ico16, ico32, ico48]));

  // Also place a favicon.ico at the app root for default discovery.
  await writeFile(
    join(ROOT, 'app', 'favicon.ico'),
    pngToIco([ico16, ico32, ico48]),
  );

  // eslint-disable-next-line no-console
  console.log('Generated Reel icon set in public/icons/');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

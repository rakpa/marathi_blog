// One-off generator for branded placeholder hero covers (1600×1000 JPG).
// Real photos can replace these later — they're abstract editorial covers
// so the build is self-contained and the <Image> optimisation pipeline works.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync(new URL('../src/assets', import.meta.url), { recursive: true });

const covers = [
  { file: 'hero-startups.jpg',   c1: '#d9480f', c2: '#7a1f02', glyph: '🚀' },
  { file: 'hero-business.jpg',   c1: '#1f6f5c', c2: '#0b3a2e', glyph: '📈' },
  { file: 'hero-technology.jpg', c1: '#2563eb', c2: '#10204d', glyph: '🤖' },
];

const W = 1600, H = 1000;

for (const { file, c1, c2, glyph } of covers) {
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="r" cx="0.8" cy="0.2" r="0.9">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#r)"/>
    <circle cx="1280" cy="240" r="360" fill="#ffffff" opacity="0.06"/>
    <circle cx="300" cy="820" r="280" fill="#000000" opacity="0.10"/>
    <g opacity="0.10" stroke="#ffffff" stroke-width="2" fill="none">
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 200}" y1="0" x2="${i * 200 + 400}" y2="${H}"/>`).join('')}
    </g>
    <text x="${W / 2}" y="${H / 2}" font-size="320" text-anchor="middle" dominant-baseline="central" opacity="0.92">${glyph}</text>
  </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(
    new URL(`../src/assets/${file}`, import.meta.url).pathname,
  );
  console.log('wrote', file);
}

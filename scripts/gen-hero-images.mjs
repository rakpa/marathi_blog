// Generates branded placeholder cover images (1600×1000 JPG), one per article.
// These are abstract editorial covers (gradient + motif) so the build is
// self-contained; swap in real photos later by replacing files in src/assets.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync(new URL('../src/assets', import.meta.url), { recursive: true });

const covers = [
  // Business (green)
  { file: 'cover-sip.jpg',             c1: '#2f9e85', c2: '#114a3d', glyph: '🪙' },
  { file: 'cover-emergency-fund.jpg',  c1: '#1f8268', c2: '#0c3a2f', glyph: '🛟' },
  // Technology (blue)
  { file: 'cover-ai-tools.jpg',        c1: '#3b82f6', c2: '#112a5e', glyph: '🤖' },
  { file: 'cover-digital-security.jpg',c1: '#2563eb', c2: '#101f4a', glyph: '🔒' },
  // Startups (orange)
  { file: 'cover-startup-funding.jpg', c1: '#e8590c', c2: '#7a1f02', glyph: '🚀' },
  { file: 'cover-first-customers.jpg', c1: '#f76707', c2: '#8a2d04', glyph: '🤝' },
  // Learning (purple)
  { file: 'cover-feynman.jpg',         c1: '#8b5cf6', c2: '#3b1f7a', glyph: '💡' },
  { file: 'cover-habits.jpg',          c1: '#7c3aed', c2: '#2e1065', glyph: '🔁' },
  // Entrepreneurship (cyan)
  { file: 'cover-low-capital.jpg',     c1: '#0e9bb8', c2: '#08495a', glyph: '🌱' },
  { file: 'cover-pricing.jpg',         c1: '#0e7490', c2: '#073b49', glyph: '🏷️' },
  // Education (amber)
  { file: 'cover-study-abroad.jpg',    c1: '#d98a09', c2: '#6b3d05', glyph: '✈️' },
  { file: 'cover-interview.jpg',       c1: '#b45309', c2: '#5c2c05', glyph: '💬' },
];

const W = 1600, H = 1000;

for (const [i, { file, c1, c2, glyph }] of covers.entries()) {
  // Alternate the gradient direction for visual variety across the feed.
  const flip = i % 2 === 0;
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="${flip ? 0 : 1}" y1="0" x2="${flip ? 1 : 0}" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="r" cx="${flip ? 0.82 : 0.18}" cy="0.18" r="0.9">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#r)"/>
    <circle cx="${flip ? 1290 : 310}" cy="230" r="340" fill="#ffffff" opacity="0.06"/>
    <circle cx="${flip ? 280 : 1320}" cy="830" r="260" fill="#000000" opacity="0.10"/>
    <g opacity="0.08" stroke="#ffffff" stroke-width="2" fill="none">
      ${Array.from({ length: 9 }, (_, k) => `<line x1="${k * 200}" y1="0" x2="${k * 200 + 380}" y2="${H}"/>`).join('')}
    </g>
    <text x="${W / 2}" y="${H / 2}" font-size="300" text-anchor="middle" dominant-baseline="central" opacity="0.95">${glyph}</text>
  </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(
    new URL(`../src/assets/${file}`, import.meta.url).pathname,
  );
  console.log('wrote', file);
}

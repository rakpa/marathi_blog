/**
 * Generate one branded gradient fallback cover per category into
 * public/covers/cat-<category>.jpg. These are used as the onerror fallback
 * when a remote topical photo fails to load.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/covers/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const COLORS = {
  business: ['#1f8268', '#0c3a2f', '📈'],
  technology: ['#2563eb', '#101f4a', '💻'],
  startups: ['#e8590c', '#7a1f02', '🚀'],
  learning: ['#7c3aed', '#2e1065', '🧠'],
  entrepreneurship: ['#0e7490', '#073b49', '🌱'],
  education: ['#b45309', '#5c2c05', '🎓'],
  sports: ['#c2255c', '#6b1438', '🏅'],
};

const W = 1200, H = 675;
for (const [cat, [c1, c2, glyph]] of Object.entries(COLORS)) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
      <radialGradient id="r" cx="0.82" cy="0.18" r="0.9">
      <stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/>
    <circle cx="980" cy="150" r="240" fill="#fff" opacity="0.06"/>
    <text x="${W / 2}" y="${H / 2}" font-size="210" text-anchor="middle" dominant-baseline="central" opacity="0.95">${glyph}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}cat-${cat}.jpg`);
  console.log(`wrote public/covers/cat-${cat}.jpg`);
}

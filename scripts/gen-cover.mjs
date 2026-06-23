/**
 * Generate a single branded cover image for one article.
 * Usage: node scripts/gen-cover.mjs <slug> <category>
 *   <category> ∈ business | technology | startups | learning | entrepreneurship | education
 * Writes src/assets/<slug>.jpg
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../src/assets/', import.meta.url));

const COLORS = {
  business: ['#1f8268', '#0c3a2f', '📈'],
  technology: ['#2563eb', '#101f4a', '💻'],
  startups: ['#e8590c', '#7a1f02', '🚀'],
  learning: ['#7c3aed', '#2e1065', '🧠'],
  entrepreneurship: ['#0e7490', '#073b49', '🌱'],
  education: ['#b45309', '#5c2c05', '🎓'],
  sports: ['#c2255c', '#6b1438', '🏅'],
};

const slug = process.argv[2];
const category = process.argv[3];
if (!slug || !COLORS[category]) {
  console.error('Usage: node scripts/gen-cover.mjs <slug> <business|technology|startups|learning|entrepreneurship|education>');
  process.exit(1);
}

const [c1, c2, glyph] = COLORS[category];
const W = 1600, H = 1000;
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="r" cx="0.82" cy="0.18" r="0.9">
    <stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/>
  <circle cx="1290" cy="230" r="340" fill="#fff" opacity="0.06"/>
  <circle cx="280" cy="830" r="260" fill="#000" opacity="0.1"/>
  <text x="${W / 2}" y="${H / 2}" font-size="300" text-anchor="middle" dominant-baseline="central" opacity="0.95">${glyph}</text>
</svg>`;

mkdirSync(ASSETS, { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(`${ASSETS}${slug}.jpg`);
console.log(`wrote src/assets/${slug}.jpg`);

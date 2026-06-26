/**
 * Generate a single polished, topic-specific illustration cover for one article.
 * Usage: node scripts/gen-cover.mjs <slug> <category> [emoji]
 *   <category> ∈ business|technology|startups|learning|entrepreneurship|education|sports
 *   [emoji]    optional topic motif (defaults to the category's emoji)
 * Writes src/assets/<slug>.jpg
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../src/assets/', import.meta.url));

const CAT = {
  business: ['#1f8268', '#0c3a2f', '📈'],
  technology: ['#2563eb', '#101f4a', '💻'],
  startups: ['#e8590c', '#7a1f02', '🚀'],
  learning: ['#7c3aed', '#2e1065', '🧠'],
  entrepreneurship: ['#0e7490', '#073b49', '🌱'],
  education: ['#b45309', '#5c2c05', '🎓'],
  sports: ['#c2255c', '#6b1438', '🏅'],
};

const [slug, category, emojiArg] = process.argv.slice(2);
if (!slug || !CAT[category]) {
  console.error('Usage: node scripts/gen-cover.mjs <slug> <category> [emoji]');
  process.exit(1);
}
const [c1, c2, defGlyph] = CAT[category];
const glyph = emojiArg || defGlyph;

const W = 1200, H = 675;
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="spot" cx="0.5" cy="0.46" r="0.42">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g opacity="0.07" fill="#ffffff">
    ${Array.from({ length: 7 }, (_, r) =>
      Array.from({ length: 13 }, (_, c) => `<circle cx="${40 + c * 96}" cy="${40 + r * 96}" r="3"/>`).join('')
    ).join('')}
  </g>
  <circle cx="1000" cy="170" r="300" fill="#ffffff" opacity="0.07"/>
  <circle cx="160" cy="560" r="240" fill="#000000" opacity="0.12"/>
  <rect width="${W}" height="${H}" fill="url(#spot)"/>
  <text x="${W / 2}" y="${H / 2}" font-size="280" text-anchor="middle" dominant-baseline="central">${glyph}</text>
</svg>`;

mkdirSync(ASSETS, { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(`${ASSETS}${slug}.jpg`);
console.log(`wrote src/assets/${slug}.jpg`);

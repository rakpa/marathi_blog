// Generates the default Open Graph card and apple-touch-icon into /public.
import sharp from 'sharp';

const og = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b3261e"/><stop offset="1" stop-color="#7a160f"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="980" cy="140" r="260" fill="#ffffff" opacity="0.07"/>
  <rect x="90" y="120" width="120" height="120" rx="28" fill="#ffffff"/>
  <text x="150" y="200" font-size="78" text-anchor="middle" font-family="Georgia,serif" fill="#b3261e">वि</text>
  <text x="92" y="380" font-size="92" font-family="Georgia,serif" fill="#ffffff">विद्या</text>
  <text x="96" y="450" font-size="40" font-family="Georgia,serif" fill="#ffffff" opacity="0.92">जगातलं उत्तम ज्ञान — तुमच्या भाषेत.</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');

const icon = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#b3261e"/>
  <text x="90" y="120" font-size="100" text-anchor="middle" font-family="Georgia,serif" fill="#ffffff">वि</text></svg>`;
await sharp(Buffer.from(icon)).png().toFile('public/apple-touch-icon.png');
console.log('wrote og-default.png + apple-touch-icon.png');

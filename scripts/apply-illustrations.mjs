/**
 * Switch every article from remote photos to a polished, topic-specific
 * illustration cover:
 *   1. remove any `heroImageUrl:` line (so the local heroImage is used);
 *   2. regenerate src/assets/<slug>.jpg as a designed illustration whose motif
 *      (emoji) matches the article's subject, on its category-colour gradient.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ART = fileURLToPath(new URL('../src/content/articles/', import.meta.url));
const ASSETS = fileURLToPath(new URL('../src/assets/', import.meta.url));

const CAT_COLORS = {
  business: ['#1f8268', '#0c3a2f'],
  technology: ['#2563eb', '#101f4a'],
  startups: ['#e8590c', '#7a1f02'],
  learning: ['#7c3aed', '#2e1065'],
  entrepreneurship: ['#0e7490', '#073b49'],
  education: ['#b45309', '#5c2c05'],
  sports: ['#c2255c', '#6b1438'],
};

// Topic-specific motif per article (chosen to render reliably as colour emoji).
const EMOJI = {
  'aapatkalin-nidhi': '🏦',
  'ai-era-skills-careers': '🤖',
  'bharatiya-buddhibal-suvarnayug': '🏆',
  'bharatiya-startup-funding-2026': '🚀',
  'business-idea-validation': '💡',
  'changlya-savayi': '🔁',
  'chatgpt-claude-gemini-konta-ai-vaprava': '🤖',
  'co-founder-kasa-nivadava': '🤝',
  'credit-score-marathi': '💳',
  'deep-work-ekagrata': '🎯',
  'deepfake-kase-olkhave': '🎭',
  'devika-sihag-thailand-masters-2026': '🏸',
  'digital-suraksha': '🔒',
  'elon-musk-spacex-ipo-trillionaire': '🚀',
  'feynman-tantra': '💡',
  'fifa-world-cup-2026-marathi': '⚽',
  'grahak-tikavnyachi-kala': '🛒',
  'health-insurance-marathi': '🏥',
  'income-tax-2026-marathi': '🧾',
  'indiaai-mission-gpu-compute': '💻',
  'ipo-gmp-samjun-ghya': '📊',
  'kami-bhandavalat-vyavsay': '🌱',
  'kimmat-kashi-tharvaychi': '💵',
  'meta-cred-kunal-shah-whatsapp': '💬',
  'mulakhat-tayari': '💼',
  'pahila-grahak': '🤝',
  'pardeshi-shikshan-tayari': '🌍',
  'pramaana-labs-ai-verification-seed': '✅',
  'resume-kasa-lihava': '📄',
  'sarvam-ai-unicorn-marathi': '🦄',
  'share-bazar-padla-june-2026': '📉',
  'sip-guntavnuk-marathi-margdarshak': '📈',
  'sone-guntavnuk-kashi-karavi': '🥇',
  'spaced-repetition-marathi': '🧠',
  'vaishali-rameshbabu-candidates-2026': '👑',
};

const W = 1200, H = 675;
function illustration(c1, c2, glyph, flip) {
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="${flip ? 1 : 0}" y1="0" x2="${flip ? 0 : 1}" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="spot" cx="0.5" cy="0.46" r="0.42">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <g opacity="0.07" fill="#ffffff">
      ${Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 13 }, (_, c) => `<circle cx="${40 + c * 96}" cy="${40 + r * 96}" r="3"/>`).join('')
      ).join('')}
    </g>
    <circle cx="${flip ? 200 : 1000}" cy="170" r="300" fill="#ffffff" opacity="0.07"/>
    <circle cx="${flip ? 1040 : 160}" cy="560" r="240" fill="#000000" opacity="0.12"/>
    <rect width="${W}" height="${H}" fill="url(#spot)"/>
    <text x="${W / 2}" y="${H / 2}" font-size="280" text-anchor="middle" dominant-baseline="central">${glyph}</text>
  </svg>`;
}

const files = readdirSync(ART).filter((f) => f.endsWith('.md'));
let i = 0, done = 0;
for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  const path = ART + f;
  let src = readFileSync(path, 'utf8');
  // 1. strip remote photo URL
  src = src.replace(/^heroImageUrl:.*\n/m, '');
  writeFileSync(path, src);
  // 2. regenerate the illustration
  const cat = (src.match(/^category:\s*(\w+)/m) || [])[1] || 'business';
  const [c1, c2] = CAT_COLORS[cat] || CAT_COLORS.business;
  const glyph = EMOJI[slug] || '✨';
  await sharp(Buffer.from(illustration(c1, c2, glyph, i++ % 2 === 0)))
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`${ASSETS}${slug}.jpg`);
  done++;
}
console.log(`Applied topic illustrations to ${done} article(s); removed remote photo URLs.`);

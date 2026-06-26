/**
 * Inject a topical remote photo URL (heroImageUrl) into each article's
 * frontmatter, matched to its subject. Uses LoremFlickr (Creative-Commons
 * keyword photos) with a stable ?lock so the chosen image is consistent.
 * Idempotent: skips articles that already have heroImageUrl.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../src/content/articles/', import.meta.url));

// slug -> topical English keywords (comma-separated for LoremFlickr)
const KEYWORDS = {
  'aapatkalin-nidhi': 'savings,money,piggybank',
  'ai-era-skills-careers': 'artificial-intelligence,career,skills',
  'bharatiya-buddhibal-suvarnayug': 'chess,board,game',
  'bharatiya-startup-funding-2026': 'startup,office,growth',
  'business-idea-validation': 'startup,idea,whiteboard',
  'changlya-savayi': 'habit,morning,routine',
  'chatgpt-claude-gemini-konta-ai-vaprava': 'artificial-intelligence,robot,laptop',
  'co-founder-kasa-nivadava': 'partnership,handshake,team',
  'credit-score-marathi': 'credit-card,finance',
  'deep-work-ekagrata': 'focus,desk,study',
  'deepfake-kase-olkhave': 'face,technology,digital',
  'devika-sihag-thailand-masters-2026': 'badminton,shuttlecock',
  'digital-suraksha': 'cybersecurity,lock,password',
  'elon-musk-spacex-ipo-trillionaire': 'rocket,spacex,launch',
  'feynman-tantra': 'blackboard,teaching,learning',
  'fifa-world-cup-2026-marathi': 'football,soccer,stadium',
  'grahak-tikavnyachi-kala': 'customer,shop,service',
  'health-insurance-marathi': 'health,hospital,doctor',
  'income-tax-2026-marathi': 'tax,calculator,money',
  'indiaai-mission-gpu-compute': 'datacenter,server,technology',
  'ipo-gmp-samjun-ghya': 'stock-market,trading,finance',
  'kami-bhandavalat-vyavsay': 'small-business,shop,entrepreneur',
  'kimmat-kashi-tharvaychi': 'price,shopping,tag',
  'meta-cred-kunal-shah-whatsapp': 'smartphone,app,messaging',
  'mulakhat-tayari': 'interview,office,job',
  'pahila-grahak': 'handshake,customer,business',
  'pardeshi-shikshan-tayari': 'university,graduation,study',
  'pramaana-labs-ai-verification-seed': 'artificial-intelligence,code,technology',
  'resume-kasa-lihava': 'resume,cv,desk',
  'sarvam-ai-unicorn-marathi': 'artificial-intelligence,india,technology',
  'share-bazar-padla-june-2026': 'stock-market,chart,trading',
  'sip-guntavnuk-marathi-margdarshak': 'investment,money,growth',
  'sone-guntavnuk-kashi-karavi': 'gold,jewellery,investment',
  'spaced-repetition-marathi': 'study,books,memory',
  'vaishali-rameshbabu-candidates-2026': 'chess,tournament,game',
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
let lock = 11;
let changed = 0;
for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  const path = DIR + f;
  let src = readFileSync(path, 'utf8');
  if (/^heroImageUrl:/m.test(src)) continue; // already set
  const kw = KEYWORDS[slug] || 'india,news';
  lock += 7;
  const url = `https://loremflickr.com/1200/675/${kw}?lock=${lock}`;
  // Insert right after the heroImage: line (every article has one).
  if (/^heroImage:.*$/m.test(src)) {
    src = src.replace(/^(heroImage:.*)$/m, `$1\nheroImageUrl: "${url}"`);
  } else {
    // Fallback: insert after summary
    src = src.replace(/^(summary:.*)$/m, `$1\nheroImageUrl: "${url}"`);
  }
  writeFileSync(path, src);
  changed++;
}
console.log(`Added heroImageUrl to ${changed} article(s).`);

/**
 * विद्या — automated news → Marathi article pipeline.
 *
 * Runs on a schedule (every 30 min via GitHub Actions, or any cron). Each run:
 *   1. Pulls the latest India business / tech / startup headlines (Google News RSS).
 *   2. Skips anything already seen or already published ("heartbeat" de-dup).
 *   3. For each fresh candidate, asks Claude (with the web_search server tool) to
 *      verify the story across credible sources and decide whether it merits a
 *      विद्या article — in-scope, genuinely useful, not politics/crime/gossip.
 *   4. If yes, Claude writes a flowing Marathi article; the script saves it,
 *      generates a cover image, and records it as published.
 *
 * It does NOT commit/push — the CI workflow does that, so the script stays a
 * pure file producer. Set DRY_RUN=1 to log decisions without writing anything.
 *
 * Required env: ANTHROPIC_API_KEY
 * Optional env: AUTO_MODEL (default claude-opus-4-8), MAX_PUBLISH_PER_RUN (1),
 *               MAX_CANDIDATES (6), DRY_RUN
 */
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url);
const ARTICLES_DIR = fileURLToPath(new URL('src/content/articles/', ROOT));
const ASSETS_DIR = fileURLToPath(new URL('src/assets/', ROOT));
const STATE_FILE = fileURLToPath(new URL('scripts/auto-publish-state.json', ROOT));

const MODEL = process.env.AUTO_MODEL || 'claude-opus-4-8';
const MAX_PUBLISH = Number(process.env.MAX_PUBLISH_PER_RUN || 1);
const MAX_CANDIDATES = Number(process.env.MAX_CANDIDATES || 6);
const DRY_RUN = !!process.env.DRY_RUN;

// Only these categories are valid; mirrors src/content.config.ts.
const CATEGORY_COLORS = {
  business: ['#1f8268', '#0c3a2f', '📈'],
  technology: ['#2563eb', '#101f4a', '💻'],
  startups: ['#e8590c', '#7a1f02', '🚀'],
  learning: ['#7c3aed', '#2e1065', '🧠'],
  entrepreneurship: ['#0e7490', '#073b49', '🌱'],
  education: ['#b45309', '#5c2c05', '🎓'],
};

// News heartbeat: queries scoped to विद्या's beats, recent items only.
const QUERIES = [
  'India business economy',
  'Indian startup funding',
  'India technology AI software',
];

const norm = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const todayISO = () => new Date().toISOString().slice(0, 10);

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { seen: {} };
  }
}

function saveState(state) {
  // Prune entries older than 21 days to keep the file small.
  const cutoff = Date.now() - 21 * 864e5;
  for (const [k, v] of Object.entries(state.seen)) {
    if (new Date(v).getTime() < cutoff) delete state.seen[k];
  }
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/** Titles of already-published articles, normalised, to avoid duplicate topics. */
function existingTitles() {
  const out = new Set();
  if (!existsSync(ARTICLES_DIR)) return out;
  for (const f of readdirSync(ARTICLES_DIR)) {
    if (!f.endsWith('.md')) continue;
    const m = readFileSync(`${ARTICLES_DIR}${f}`, 'utf8').match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (m) out.add(norm(m[1]));
  }
  return out;
}

async function fetchNews() {
  const items = [];
  for (const q of QUERIES) {
    const url =
      `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:1d')}` +
      `&hl=en-IN&gl=IN&ceid=IN:en`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VidyaBot/1.0)' },
      });
      clearTimeout(t);
      const xml = await res.text();
      for (const block of xml.match(/<item>([\s\S]*?)<\/item>/g) || []) {
        const pick = (tag) => {
          const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
          if (!m) return '';
          return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
        };
        let title = pick('title');
        const source = pick('source');
        // Google News titles look like "Headline - Source"; strip the suffix.
        if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
        const pubDate = pick('pubDate');
        if (title) items.push({ title, source, pubDate, query: q });
      }
    } catch (e) {
      console.warn(`news fetch failed for "${q}": ${e.message}`);
    }
  }
  // De-dup identical headlines, newest first.
  const byKey = new Map();
  for (const it of items) if (!byKey.has(norm(it.title))) byKey.set(norm(it.title), it);
  return [...byKey.values()].sort(
    (a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0),
  );
}

const SYSTEM = `तू "विद्या" या मराठी ज्ञान-मासिकाची वरिष्ठ संपादक आहेस. विद्या फक्त सहा विषयांवर लिहिते: व्यवसाय (business), तंत्रज्ञान (technology), स्टार्टअप (startups), शिक्षण व कौशल्ये (learning), उद्योजकता (entrepreneurship), करिअर व शिक्षण (education).

तुझं काम: दिलेल्या बातमीचा विषय वेबवर तपासणं, किमान दोन विश्वासार्ह स्रोतांशी पडताळणं, आणि तो विद्यासाठी योग्य आहे का ठरवणं.

खालीलपैकी काहीही असेल तर नाकार: राजकारण, गुन्हेगारी, सेलिब्रिटी गॉसिप, समाजात फूट पाडणारं/भडकवणारं, सनसनाटी "धक्कादायक" बातम्या, किंवा मराठी वाचकाला खरं मूल्य न देणारं काहीही. वरील सहा विषयांत न बसणारी बातमीही नाकार.

लेखनाचे नियम:
- नैसर्गिक, आधुनिक, संवादी मराठी (देवनागरी). यांत्रिक भाषांतर नको. उबदार, आत्मविश्वासी संपादकीय आवाज.
- मुख्यतः वाहत्या परिच्छेदांत लिही — खूप बुलेट याद्या टाळ. २-४ उपशीर्षकं (## ) चालतील.
- मजकुरात तथ्यं फक्त पडताळलेलीच वापर. आकडे/अवतरणं काल्पनिक रचू नकोस. मत आणि तथ्य वेगळं ठेव.
- स्रोत म्हणून फक्त मूळ/अधिकृत/प्रतिष्ठित वृत्तसंस्था दे. ब्लॉग किंवा प्रमोशनल/मार्केटिंग संकेतस्थळांचे दुवे कधीही देऊ नकोस; तसे स्रोत नसतील तर sources रिकामं ठेव.
- रचना: बलवान शीर्षक, एक-ओळीचा "का वाचावं" सारांश, ३ मुख्य मुद्दे, आणि शेवटी "पुढचं पाऊल" देणारा परिच्छेद.`;

function buildPrompt(cand, related) {
  return `आजची तारीख: ${todayISO()}.

ट्रेंड होत असलेली एक संभाव्य बातमी:
"${cand.title}" — स्रोत: ${cand.source || 'अज्ञात'} (${cand.pubDate || ''})

त्याच वेळचे इतर संबंधित मथळे (संदर्भासाठी):
${related.map((r) => `- ${r.title} (${r.source})`).join('\n')}

कृती:
1) web_search वापरून ही बातमी तपास आणि किमान दोन विश्वासार्ह स्रोतांशी पडताळ.
2) ती विद्यासाठी योग्य आहे का ठरव (नियम वर दिले आहेत).

जर योग्य नसेल, तर फक्त एका ओळीत उत्तर दे: SKIP: <थोडक्यात कारण>

जर योग्य असेल, तर फक्त एक संपूर्ण Markdown लेख-फाइल आउटपुट कर (इतर काहीही मजकूर नको, बॅकटिक्स नकोत). सुरुवात अशी YAML frontmatter ने कर:
---
title: "..."
summary: "एक ओळीचा का-वाचावं सारांश"
category: business|technology|startups|learning|entrepreneurship|education
type: report|analysis
slug: ascii-kebab-case-slug
tags: ["...", "..."]
takeaways:
  - "मुद्दा १"
  - "मुद्दा २"
  - "मुद्दा ३"
sources:
  - title: "स्रोताचं नाव"
    url: "https://..."
---

(इथून पुढे वाहत्या परिच्छेदांत मराठी लेख. publishDate किंवा heroImage टाकू नकोस — ते आपोआप जोडलं जाईल.)`;
}

/** Run one Claude turn with web_search, resolving any pause_turn loops. */
async function research(client, prompt) {
  const messages = [{ role: 'user', content: prompt }];
  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 6 }],
      system: SYSTEM,
      messages,
    });
    if (res.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: res.content });
      continue;
    }
    if (res.stop_reason === 'refusal') return 'SKIP: model declined';
    return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  }
  return 'SKIP: research did not converge';
}

async function makeCover(slug, category) {
  const [c1, c2, glyph] = CATEGORY_COLORS[category] || CATEGORY_COLORS.business;
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
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(`${ASSETS_DIR}auto-${slug}.jpg`);
}

function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set — nothing to do.');
    return;
  }
  const client = new Anthropic();
  const state = loadState();
  const published = existingTitles();

  const news = await fetchNews();
  console.log(`Fetched ${news.length} headlines.`);

  const fresh = news.filter((it) => {
    const k = norm(it.title);
    return !state.seen[k] && !published.has(k);
  }).slice(0, MAX_CANDIDATES);
  console.log(`${fresh.length} fresh candidates to consider.`);

  let count = 0;
  for (const cand of fresh) {
    if (count >= MAX_PUBLISH) break;
    const key = norm(cand.title);
    state.seen[key] = new Date().toISOString(); // mark attempted regardless of outcome

    const related = fresh.filter((r) => r !== cand).slice(0, 5);
    let out;
    try {
      out = await research(client, buildPrompt(cand, related));
    } catch (e) {
      console.warn(`research error for "${cand.title}": ${e.message}`);
      continue;
    }

    if (!out || out.startsWith('SKIP')) {
      console.log(`SKIP "${cand.title}" — ${out?.slice(6).trim() || 'no output'}`);
      continue;
    }

    const fmMatch = out.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) {
      console.warn(`Unparseable output for "${cand.title}"`);
      continue;
    }
    let [, fm, body] = fmMatch;
    const slug = (field(fm, 'slug') || `news-${todayISO()}-${Date.now().toString(36)}`)
      .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const category = field(fm, 'category');
    if (!CATEGORY_COLORS[category]) {
      console.warn(`Invalid category "${category}" for "${cand.title}" — skipping`);
      continue;
    }
    const title = field(fm, 'title') || cand.title;

    // Inject the fields the script owns: publishDate + hero image.
    fm = fm.replace(/^slug:.*$/m, '').trim();
    const fullFm = [
      fm,
      `publishDate: ${todayISO()}`,
      `heroImage: ../../assets/auto-${slug}.jpg`,
      `heroImageAlt: "${title.replace(/"/g, "'")}"`,
      `heroCredit: "चित्र: विद्या ग्राफिक्स"`,
    ].join('\n');
    const file = `---\n${fullFm}\n---\n${body.trim()}\n`;

    if (DRY_RUN) {
      console.log(`[dry-run] would publish: ${slug} (${category})\n${file.slice(0, 400)}…`);
    } else {
      mkdirSync(ARTICLES_DIR, { recursive: true });
      mkdirSync(ASSETS_DIR, { recursive: true });
      writeFileSync(`${ARTICLES_DIR}${slug}.md`, file);
      await makeCover(slug, category);
      console.log(`PUBLISHED: ${slug}.md (${category}) — "${title}"`);
    }
    count++;
  }

  if (!DRY_RUN) saveState(state);
  console.log(`Done. Published ${count} article(s) this run.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

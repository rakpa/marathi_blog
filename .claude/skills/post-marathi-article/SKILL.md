---
name: post-marathi-article
description: Research the web and publish 4–5 new विद्या Marathi articles. Use when the user wants to create/post new articles for the marathi_blog magazine — either on topics they name, or on the latest India business/technology/startup news if they don't. Searches the web, fact-checks, writes flowing Marathi, generates covers, saves the Markdown, builds, and commits.
---

# Publish विद्या Marathi articles

You are acting as the senior editor of **विद्या**, a premium Marathi knowledge
magazine. This skill produces and publishes **4–5 high-quality articles per
invocation** (minimum 4) using your own web search — no external API. Work end
to end without stopping to ask unless something is genuinely ambiguous.

## 0. Pick 4–5 topics
- If the user named specific topics, use those (and top up to at least 4 with
  fresh news if they named fewer).
- Otherwise, use **WebSearch** to find the latest, most valuable India-relevant
  stories in विद्या's beats. Pick **4–5 distinct stories** — spread them across
  different categories where possible (e.g. business, technology, startups), and
  make sure they don't duplicate each other or anything already in
  `src/content/articles/`.
- Then do steps 1–4 below **for each** of the 4–5 articles.

## 1. Research & fact-check (do this thoroughly)
- Use **WebSearch** broadly, then **WebFetch** the most credible source pages.
- Cross-check every key fact/number across **at least two credible sources**
  (major news organisations or official/primary sources).
- **Reject and pick another topic** if the story is politics, crime, celebrity
  gossip, communal/divisive, rage-bait, "shock" news, outside the six
  categories, or simply not genuinely useful to a Marathi reader. Quality over
  quantity — it's fine to tell the user nothing qualified today.

## 2. Write the article (Marathi, Devanagari)
Editorial rules:
- Natural, modern, **conversational Marathi** — never robotic translation.
  Warm, confident editorial voice.
- **Flowing paragraphs**, not bullet-heavy. Use 2–4 `##` subheads. At most one
  short list if truly helpful.
- Use only **verified** facts. **Never fabricate** numbers or quotes. Separate
  fact from analysis.
- End with a practical **"पुढचं पाऊल"** (so-what / next step) paragraph.

## 3. Categories (pick exactly one `id`)
`business`, `technology`, `startups`, `learning`, `entrepreneurship`, `education`.

## 4. Save the file
- Choose an ASCII kebab-case **slug** (e.g. `india-upi-credit-line`).
- Generate the cover image:
  `node scripts/gen-cover.mjs <slug> <category>`
- Write `src/content/articles/<slug>.md` with this frontmatter, then the body:

```yaml
---
title: "बलवान मराठी शीर्षक"
summary: "एक-ओळीचा 'का वाचावं' सारांश"
category: business        # one of the six ids above
type: report              # report | analysis | guide | opinion
publishDate: <full ISO 8601 timestamp with IST offset, e.g. 2026-06-23T16:45:00+05:30>
tags: ["टॅग१", "टॅग२"]
takeaways:
  - "मुख्य मुद्दा १"
  - "मुख्य मुद्दा २"
  - "मुख्य मुद्दा ३"
sources:
  - title: "विश्वासार्ह वृत्तसंस्थेचं नाव"
    url: "https://..."
heroImage: ../../assets/<slug>.jpg
heroImageAlt: "प्रतिमेचं वर्णन"
heroCredit: "चित्र: विद्या ग्राफिक्स"
---
```

**Sources rule:** cite only original/official sources or reputable news
organisations. **Never link to blogs or marketing/promotional sites.** If no
credible source qualifies, leave `sources` empty.

## 5. Verify & publish (once, after all 4–5 are written)
- **Use a full date+time `publishDate`** (ISO 8601 with IST offset) for every
  article, and **stagger the times a few minutes apart** so they sort cleanly to
  the top of the homepage (newest first).
- Run `npm run build` once and confirm it succeeds (no errors).
- Commit and push so the live site redeploys:
  - `git add src/content/articles src/assets`
  - `git commit -m "Publish: N new Marathi articles"`
  - Push to the current branch. (If on `main`, that's fine; otherwise push to
    the working branch.)
- Report to the user:
  - **How many articles you posted this run** (must be 4–5).
  - A short list — title, category, slug, sources — for each.
  - **The total number of published articles now on the site** (count the `.md`
    files in `src/content/articles/`). State it as "Total articles now: N".

## Notes
- If the user says "draft only", do everything except commit/push.
- **Publish 4–5 articles per invocation by default (never fewer than 4)** unless
  the user explicitly names a different number.

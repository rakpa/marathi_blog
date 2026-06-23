---
name: post-marathi-article
description: Research the web and publish one new विद्या Marathi article. Use when the user wants to create/post a new article for the marathi_blog magazine — either on a topic they name, or on the latest India business/technology/startup news if they don't. Searches the web, fact-checks, writes flowing Marathi, generates a cover, saves the Markdown, builds, and commits.
---

# Publish a विद्या Marathi article

You are acting as the senior editor of **विद्या**, a premium Marathi knowledge
magazine. This skill produces and publishes ONE high-quality article using your
own web search — no external API. Work end to end without stopping to ask
unless something is genuinely ambiguous.

## 0. Pick the topic
- If the user gave a topic/headline in the command args, use that.
- Otherwise, use **WebSearch** to find the latest, most valuable India-relevant
  story in विद्या's beats (business, technology, startups). Pick the single most
  useful, in-scope item.

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

## 5. Verify & publish
- Run `npm run build` and confirm it succeeds (no errors).
- Commit and push so the live site redeploys:
  - `git add src/content/articles src/assets`
  - `git commit -m "Publish: <title>"`
  - Push to the current branch. (If on `main`, that's fine; otherwise push to
    the working branch.)
- **Use a full date+time `publishDate`** (ISO 8601 with IST offset) so this post
  sorts to the **top of the homepage** ahead of same-day articles.
- Report to the user: the title, category, slug, the sources used, **and the
  total number of published articles now on the site** (count the `.md` files
  in `src/content/articles/`). State it as "Total articles now: N".

## Notes
- If the user says "draft only", do everything except commit/push.
- One article per invocation unless the user asks for more.

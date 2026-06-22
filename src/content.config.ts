import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The six categories विद्या covers. These are intentionally constrained —
 * politics, crime, gossip and rage-bait are out of scope by design.
 * Keep the `id` stable (used in URLs); `label` is the Marathi display name.
 */
export const CATEGORIES = {
  business:         { label: 'व्यवसाय',          en: 'Business',          emoji: '💼', color: '#1f6f5c' },
  technology:       { label: 'तंत्रज्ञान',        en: 'Technology',        emoji: '💻', color: '#2563eb' },
  startups:         { label: 'स्टार्टअप',         en: 'Startups',          emoji: '🚀', color: '#d9480f' },
  learning:         { label: 'शिक्षण व कौशल्ये', en: 'Learning & Skills', emoji: '🧠', color: '#7c3aed' },
  entrepreneurship: { label: 'उद्योजकता',        en: 'Entrepreneurship',  emoji: '🌱', color: '#0e7490' },
  education:        { label: 'करिअर व शिक्षण',   en: 'Education',         emoji: '🎓', color: '#b45309' },
} as const;

export type CategoryId = keyof typeof CATEGORIES;

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // The one-line "का वाचावं" / why-it-matters summary shown under the headline.
      summary: z.string(),
      category: z.enum(
        Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]],
      ),
      tags: z.array(z.string()).default([]),
      author: z.string().default('विद्या संपादकीय'),
      // ISO dates. `updated` is optional and shown when an article is revised.
      publishDate: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // Hero image: either a local asset (optimised) or a remote URL string.
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      heroCredit: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      // "मुख्य मुद्दे" — the key-takeaways box rendered near the top.
      takeaways: z.array(z.string()).default([]),
      // Editorial: explicit fact-check sources, rendered in the article footer.
      sources: z
        .array(z.object({ title: z.string(), url: z.string().url() }))
        .default([]),
      // Distinguishes reported fact from opinion/analysis (trust rule #5).
      type: z.enum(['report', 'guide', 'analysis', 'opinion']).default('report'),
    }),
});

export const collections = { articles };

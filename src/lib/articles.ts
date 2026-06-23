import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

// A post is published unless explicitly marked draft. We deliberately do NOT
// hide "future" dates: publishDate often carries an IST time while the build
// server runs in UTC, so a `publishDate <= now` check would wrongly hide
// recent posts. Timestamps are used only for ordering (newest first).
const isPublished = (a: Article) => !a.data.draft;

/** All published articles, newest first (by full date+time). Drafts hidden. */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles', isPublished);
  return all.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

/** Pick the most relevant related articles: same category first, then recent. */
export function relatedArticles(
  current: Article,
  pool: Article[],
  limit = 3,
): Article[] {
  const others = pool.filter((a) => a.id !== current.id);
  const sameCat = others.filter((a) => a.data.category === current.data.category);
  const rest = others.filter((a) => a.data.category !== current.data.category);
  return [...sameCat, ...rest].slice(0, limit);
}

import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

const isPublished = (a: Article) =>
  !a.data.draft && a.data.publishDate <= new Date();

/** All published articles, newest first. Drafts and future-dated posts hidden. */
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

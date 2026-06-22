import type { APIRoute } from 'astro';
import { getPublishedArticles } from '@/lib/articles';
import { CATEGORIES } from '@/content.config';
import { formatDateMr } from '@/lib/format';

/** Lightweight JSON index consumed by the client-side search page. */
export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();
  const index = articles.map((a) => ({
    title: a.data.title,
    summary: a.data.summary,
    url: `/articles/${a.id}`,
    category: a.data.category,
    categoryLabel: CATEGORIES[a.data.category].label,
    emoji: CATEGORIES[a.data.category].emoji,
    tags: a.data.tags,
    date: formatDateMr(a.data.publishDate),
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};

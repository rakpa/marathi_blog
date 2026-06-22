import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedArticles } from '@/lib/articles';
import { SITE } from '@/site.config';

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? 'https://vidya.example.com',
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.summary,
      pubDate: a.data.publishDate,
      link: `/articles/${a.id}`,
      categories: [a.data.category, ...a.data.tags],
      author: a.data.author,
    })),
    customData: `<language>mr-in</language>`,
  });
}

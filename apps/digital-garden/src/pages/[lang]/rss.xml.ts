import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { languages } from "../../globals/i18n.ts";
import { profile } from "../../globals/profile.ts";
import {
  createFilterPostsByLang,
  sortPostsByPublishedAt,
} from "../../utils/content.helpers.ts";
import { createTranslate } from "../../utils/i18n.helpers.ts";

export async function GET(ctx: APIContext): Promise<Response> {
  const filteredPosts = await getCollection(
    "posts",
    createFilterPostsByLang(ctx.currentLocale),
  );
  const sortedPosts = sortPostsByPublishedAt(filteredPosts);

  const t = createTranslate(ctx.currentLocale);

  return rss({
    title: t(profile.title),
    description: t(profile.description),
    site: ctx.url.origin,
    items: sortedPosts.map((post) => {
      const { title, description, publishedAt, tags } = post.data;

      const [lang, id] = post.id.split("/");

      return {
        title,
        description,
        pubDate: publishedAt,
        link: `${ctx.url.origin}/${lang}/${post.collection}/${id}`,
        categories: tags.map((tag) => tag.id),
        author: "vorant94@pm.me",
      };
    }),
  });
}

export function getStaticPaths() {
  return languages.map((lang) => ({
    params: { lang },
  }));
}

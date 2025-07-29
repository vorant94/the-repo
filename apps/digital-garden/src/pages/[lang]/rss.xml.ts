import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { profile } from "../../globals/profile.ts";
import { languages } from "../../i18n/ui.ts";
import { sortPostsByPublishedAt } from "../../utils/content.helpers.ts";

export async function GET(ctx: APIContext) {
  const filteredPosts = await getCollection("posts", (post) => {
    const [postLang] = post.id.split("/");
    return ctx.params.lang === postLang;
  });
  const sortedPosts = sortPostsByPublishedAt(filteredPosts);

  return rss({
    title: profile.title,
    description: profile.description,
    // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
    site: ctx.site!.origin,
    items: sortedPosts.map((post) => {
      const { title, description, publishedAt, tags } = post.data;

      const [lang, id] = post.id.split("/");

      return {
        title,
        description,
        pubDate: publishedAt,
        // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
        link: `${ctx.site!.origin}/${lang}/${post.collection}/${id}`,
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

import { getCollection } from "astro:content";
import { profile } from "@/globals/profile.ts";
import { sortPostsByPublishedAt } from "@/utils/content.helpers.ts";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(ctx: APIContext) {
  const posts = sortPostsByPublishedAt(await getCollection("posts"));

  return rss({
    title: profile.title,
    description: profile.description,
    // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
    site: ctx.site!.origin,
    items: posts.map((post) => {
      const { title, description, publishedAt, tags } = post.data;

      return {
        title,
        description,
        pubDate: publishedAt,
        // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
        link: `${ctx.site!.origin}/${post.collection}/${post.id}`,
        categories: tags.map((tag) => tag.id),
        author: "vorant94@pm.me",
      };
    }),
  });
}

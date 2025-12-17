import type { CollectionEntry } from "astro:content";
import { compareDesc } from "date-fns";
import { defaultLang } from "../globals/i18n.ts";

export type PostModel = CollectionEntry<"posts">;
export type TagModel = CollectionEntry<"tags">;

type PostWithCoverModel = Omit<PostModel, "data"> & {
  data: Extract<PostModel["data"], { coverImage: unknown }>;
};

export function sortPostsByPublishedAt(
  posts: Array<PostModel>,
): Array<PostModel> {
  return posts.toSorted((a, b) =>
    compareDesc(a.data.publishedAt, b.data.publishedAt),
  );
}

export function createFilterPostsByLang(
  lang: string = defaultLang,
): (post: PostModel) => boolean {
  return (post) => {
    const [postLang] = post.id.split("/");
    return filterOutDraftPosts(post) && lang === postLang;
  };
}

export function filterOutDraftPosts(post: PostModel): boolean {
  return import.meta.env.PROD ? !post.data.isDraft : true;
}

export function isPostWithCover(post: PostModel): post is PostWithCoverModel {
  return "coverImage" in post.data;
}

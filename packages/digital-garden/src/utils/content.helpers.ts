import type { CollectionEntry } from "astro:content";
import { compareDesc } from "date-fns";

export type PostModel = CollectionEntry<"posts">;
export type TagModel = CollectionEntry<"tags">;

export type PostWithCoverModel = Omit<PostModel, "data"> & {
  data: Extract<PostModel["data"], { coverImage: unknown }>;
};

export function sortPostsByPublishedAt(
  posts: Array<PostModel>,
): Array<PostModel> {
  return posts.toSorted((a, b) =>
    compareDesc(a.data.publishedAt, b.data.publishedAt),
  );
}

export function isPostWithCover(post: PostModel): post is PostWithCoverModel {
  return "coverImage" in post.data;
}

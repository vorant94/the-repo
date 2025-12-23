import { defineAction } from "astro:actions";
import z from "zod";
import { type CommentWithAuthor, getComments } from "../lib/comments";

export const fetchComments = defineAction({
  input: z.object({
    postSlug: z.string(),
  }),
  handler: ({ postSlug }, ctx): Promise<Array<CommentWithAuthor>> =>
    getComments(ctx, postSlug),
});

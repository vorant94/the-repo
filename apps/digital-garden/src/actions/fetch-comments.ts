import { defineAction } from "astro:actions";
import z from "zod";
import { getComments } from "../lib/comments";

export const fetchComments = defineAction({
  input: z.object({
    postSlug: z.string(),
  }),
  handler: ({ postSlug }, ctx) => getComments(ctx, postSlug),
});

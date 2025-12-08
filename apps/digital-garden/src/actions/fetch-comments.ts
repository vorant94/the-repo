import { defineAction } from "astro:actions";
import { eq } from "drizzle-orm";
import z from "zod";
import { commentSchema, comments } from "../schema/comments";

export const fetchComments = defineAction({
  input: z.object({
    postSlug: z.string(),
  }),
  handler: async (input, ctx) => {
    const { db } = ctx.locals;

    const rawComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postSlug, input.postSlug));

    return rawComments.map((raw) => commentSchema.parse(raw));
  },
});

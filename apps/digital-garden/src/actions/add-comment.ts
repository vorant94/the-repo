import { ActionError, defineAction } from "astro:actions";
import z from "zod";
import { commentSchema, comments } from "../schema/comments";

export const addComment = defineAction({
  accept: "form",
  input: z.object({
    text: z.string(),
    postSlug: z.string(),
  }),
  handler: async (input, ctx) => {
    const { user, db } = ctx.locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
      });
    }

    const [rawComment] = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        text: input.text,
        authorId: user.id,
        postSlug: input.postSlug,
      })
      .returning();

    return commentSchema.parse(rawComment);
  },
});

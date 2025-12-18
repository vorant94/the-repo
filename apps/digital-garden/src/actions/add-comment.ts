import { ActionError, defineAction } from "astro:actions";
import { addCommentInputSchema } from "../lib/api";
import type { CommentWithAuthor } from "../lib/comments";
import { commentSchema, comments } from "../schema/comments";

export const addComment = defineAction({
  input: addCommentInputSchema,
  handler: async ({ text, postSlug }, ctx): Promise<CommentWithAuthor> => {
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
        text,
        authorId: user.id,
        postSlug,
      })
      .returning();

    const { authorId: _, ...comment } = commentSchema.parse(rawComment);

    return {
      ...comment,
      author: user,
    };
  },
});

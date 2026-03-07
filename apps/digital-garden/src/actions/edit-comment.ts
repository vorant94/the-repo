import { ActionError, defineAction } from "astro:actions";
import { eq, sql } from "drizzle-orm";
import { editCommentInputSchema } from "../lib/api";
import type { CommentWithAuthor } from "../lib/comments";
import { commentSchema, comments } from "../schema/comments";

export const editComment = defineAction({
  input: editCommentInputSchema,
  handler: async ({ commentId, text }, ctx): Promise<CommentWithAuthor> => {
    const { user, db } = ctx.locals;
    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
      });
    }

    const [existingComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existingComment) {
      throw new ActionError({
        code: "NOT_FOUND",
      });
    }

    if (existingComment.authorId !== user.id) {
      throw new ActionError({
        code: "FORBIDDEN",
      });
    }

    const [rawComment] = await db
      .update(comments)
      .set({
        text,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(comments.id, commentId))
      .returning();

    const { authorId: _, ...comment } = commentSchema.parse(rawComment);

    return {
      ...comment,
      author: user,
    };
  },
});

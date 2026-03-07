import { ActionError, defineAction } from "astro:actions";
import { eq } from "drizzle-orm";
import { deleteCommentInputSchema } from "../lib/api";
import { comments } from "../schema/comments";

export const deleteComment = defineAction({
  input: deleteCommentInputSchema,
  handler: async ({ commentId }, ctx): Promise<void> => {
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

    await db.delete(comments).where(eq(comments.id, commentId));
  },
});

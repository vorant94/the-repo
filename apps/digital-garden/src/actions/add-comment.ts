import { ActionError, defineAction } from "astro:actions";
import z from "zod";
import type { CommentWithAuthor } from "../lib/comments";
import { commentSchema, comments } from "../schema/comments";

const addCommentInputSchema = z.object({
  text: z.string(),
  postSlug: z.string(),
});

export type AddCommentInput = z.infer<typeof addCommentInputSchema>;

// null in return type is needed as initial state for react action in comment-form
export type AddCommentOutput = CommentWithAuthor | null;

export const addComment = defineAction({
  accept: "form",
  input: addCommentInputSchema,
  handler: async ({ text, postSlug }, ctx): Promise<AddCommentOutput> => {
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

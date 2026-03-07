import z from "zod";

export const addCommentInputSchema = z.object({
  text: z.string(),
  postSlug: z.string(),
});
export type AddCommentInput = z.infer<typeof addCommentInputSchema>;

export const editCommentInputSchema = z.object({
  commentId: z.string(),
  text: z.string(),
});
export type EditCommentInput = z.infer<typeof editCommentInputSchema>;

export const deleteCommentInputSchema = z.object({
  commentId: z.string(),
});

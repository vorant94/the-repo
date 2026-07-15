import z from "zod";

export const addCommentInputSchema = z.object({
  text: z.string().min(1),
  postSlug: z.string(),
});
export type AddCommentInput = z.infer<typeof addCommentInputSchema>;

export const deleteCommentInputSchema = z.object({
  commentId: z.string(),
});

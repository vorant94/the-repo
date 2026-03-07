import z from "zod";

export const addCommentInputSchema = z.object({
  text: z.string(),
  postSlug: z.string(),
});
export type AddCommentInput = z.infer<typeof addCommentInputSchema>;

import { z } from "zod";

const binderNamePatternSchema = z.string().transform((pattern, ctx) => {
  try {
    return new RegExp(pattern);
  } catch (error) {
    ctx.issues.push({
      code: "custom",
      input: pattern,
      message: error instanceof Error ? error.message : String(error),
    });
    return z.NEVER;
  }
});

export const configSchema = z.object({
  split: z.object({
    tradelist: z.object({
      binderNamePattern: binderNamePatternSchema,
    }),
    wishlist: z.object({
      binderNamePattern: binderNamePatternSchema,
    }),
  }),
});
export type Config = z.infer<typeof configSchema>;

import { type Result, err, ok } from "neverthrow";
import type { ZodError, ZodSchema } from "zod";

export const ntParse = <T>(
  schema: ZodSchema<T>,
  json: unknown,
): Result<T, ZodError> => {
  const result = schema.safeParse(json);
  if (!result.success) {
    return err(result.error);
  }

  return ok(result.data);
};

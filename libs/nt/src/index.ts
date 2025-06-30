import { Result, ResultAsync, err, ok } from "neverthrow";
import type { ZodError, ZodSchema } from "zod";

export const ntParseWithZod = <T>(
  value: unknown,
  schema: ZodSchema<T>,
): Result<T, ZodError<T>> => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return err(result.error);
  }

  return ok(result.data);
};

export const ntJsonParse = Result.fromThrowable(JSON.parse);

export const ntFetch = ResultAsync.fromThrowable(fetch);

export const ntResponseJson = ResultAsync.fromThrowable((res: Response) =>
  res.json(),
);

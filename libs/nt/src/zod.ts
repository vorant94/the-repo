import { err, ok, type Result } from "neverthrow";
import type { ZodError, ZodSchema } from "zod";
import { ntFetch, ntResponseJson } from "./lib";

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

export const ntFetchJsonWithZod = <T>(
  url: string | URL,
  schema: ZodSchema<T>,
) => {
  return ntFetch(url)
    .andThen((res) => ntResponseJson(res))
    .andThen((json) => ntParseWithZod(json, schema));
};

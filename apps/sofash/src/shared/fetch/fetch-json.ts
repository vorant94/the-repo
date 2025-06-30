import { HTTPException } from "hono/http-exception";
import type { ResultAsync } from "neverthrow";
import { ntFetch, ntParseWithZod, ntResponseJson } from "nt";
import type { ZodSchema } from "zod";

export function fetchJson<T>(
  url: string | URL,
  schema: ZodSchema<T>,
): ResultAsync<T, HTTPException> {
  return ntFetch(url)
    .andThen((res) => ntResponseJson(res))
    .andThen((json) => ntParseWithZod(json, schema))
    .mapErr((err) => new HTTPException(500, { cause: err }));
}

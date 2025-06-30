import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { ntParse } from "nt-parse";
import type { ZodSchema } from "zod";

export function fetchJson<T>(
  url: string | URL,
  schema: ZodSchema<T>,
): ResultAsync<T, HTTPException> {
  return safeFetch(url)
    .andThen((res) => safeJson(res))
    .andThen((json) => ntParse(schema, json))
    .mapErr((err) => new HTTPException(500, { cause: err }));
}

const safeFetch = ResultAsync.fromThrowable(fetch);

const safeJson = ResultAsync.fromThrowable((res: Response) => res.json());

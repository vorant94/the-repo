import { HTTPException } from "hono/http-exception";
import type { ZodSchema } from "zod";

export async function fetchWithZod<T>(
  url: string | URL,
  schema: ZodSchema<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (e) {
    throw new HTTPException(500, { cause: e });
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (e) {
    throw new HTTPException(500, { cause: e });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: parsed.error });
  }

  return parsed.data;
}

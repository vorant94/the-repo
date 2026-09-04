import type { MiddlewareHandler } from "hono";
import { envSchema } from "../shared/env.ts";
import type { HonoEnv } from "../shared/hono-env.ts";

let env: HonoEnv["Variables"]["env"] | null = null;

export const envMiddleware: MiddlewareHandler<HonoEnv> = (c, next) => {
  env ??= envSchema.parse(c.env);
  c.set("env", env);

  return next();
};

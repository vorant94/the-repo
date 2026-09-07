import { drizzle } from "drizzle-orm/d1";
import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../shared/app-context.ts";
import { runWithAppContext } from "../shared/app-context.ts";
import { envSchema } from "../shared/env.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { dbConfig } from "../shared/schema/db-config.ts";

let db: AppContext["db"] | null = null;
let env: AppContext["env"] | null = null;

export const appContextMiddleware: MiddlewareHandler<HonoEnv> = (c, next) => {
  env ??= envSchema.parse(c.env);
  db ??= drizzle(c.env.DB, dbConfig);
  return runWithAppContext({ db, env }, next);
};

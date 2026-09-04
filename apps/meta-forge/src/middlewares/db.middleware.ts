import { drizzle } from "drizzle-orm/d1";
import type { MiddlewareHandler } from "hono";
import type { HonoEnv } from "../shared/hono-env.ts";
import { dbConfig } from "../shared/schema/db-config.ts";

let db: HonoEnv["Variables"]["db"] | null = null;

export const dbMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  db ??= drizzle(c.env.DB, dbConfig);
  c.set("db", db);

  await next();
};

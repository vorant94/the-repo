import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Bot } from "grammy";
import type { Env } from "hono";
import type { User } from "../schema/users.ts";
import type { Config } from "./config.ts";
import type { GrammyContext } from "./grammy-context.ts";

export interface HonoEnv extends Env {
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  Variables: {
    config: Config;
    bot: Bot<GrammyContext>;
    db: DrizzleD1Database | LibSQLDatabase;
    user: User;
    requestId: string;
  };
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  Bindings: {
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    DB: D1Database;
  };
}

import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Env } from "hono";
import type { EventReport } from "../queries/find-event-report.ts";
import type { Env as RuntimeEnv } from "./env.ts";

export interface HonoEnv extends Env {
  // biome-ignore lint/style/useNamingConvention: Hono Env generic contract
  Bindings: CloudflareBindings;
  // biome-ignore lint/style/useNamingConvention: Hono Env generic contract
  Variables: {
    db: DrizzleD1Database;
    env: RuntimeEnv;
    eventReport?: EventReport;
  };
}

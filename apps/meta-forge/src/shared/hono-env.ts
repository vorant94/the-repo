import type { Env } from "hono";

export interface HonoEnv extends Env {
  // biome-ignore lint/style/useNamingConvention: Hono Env generic contract
  Bindings: CloudflareBindings;
}

import type { Env } from "hono";

export interface HonoEnv extends Env {
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  Bindings: CloudflareBindings;
}

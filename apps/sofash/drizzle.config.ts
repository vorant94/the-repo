import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./src/shared/schema/db-config.ts";

// migrations are generated here and applied to the D1 databases (local
// Miniflare + remote) via `wrangler d1 migrations apply DB`, so no
// dbCredentials are needed for drizzle-kit generate
export default defineConfig({
  ...dbConfig,
  out: "./drizzle",
  schema: "./src/shared/schema",
  dialect: "sqlite",
});

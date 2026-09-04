import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./src/shared/schema/db-config.ts";

export default defineConfig({
  ...dbConfig,
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./src/shared/schema",
});

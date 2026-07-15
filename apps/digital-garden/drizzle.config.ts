import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./src/globals/db.ts";

export default defineConfig({
  ...dbConfig,
  out: "./drizzle",
  schema: "./src/schema",
  dialect: "sqlite",
});

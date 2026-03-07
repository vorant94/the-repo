import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import z from "zod";
import { dbConfig } from "./src/globals/db.ts";

const { error, parsed } = dotenv.config();

const dotenvConfig = z
  .object({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    DB_FILE_NAME: z.string().optional().default(":memory:"),
  })
  .parse(error ? process.env : parsed);

export default defineConfig({
  ...dbConfig,
  out: "./drizzle",
  schema: "./src/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: dotenvConfig.DB_FILE_NAME,
  },
});

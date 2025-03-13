import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { configSchema } from "./src/shared/env/config.ts";
import { dbConfig } from "./src/shared/schema/db-config";

const dotenvConfig = configSchema
  .pick({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    DB_FILE_NAME: true,
  })
  .parse(config().parsed);

export default defineConfig({
  ...dbConfig,
  out: "./drizzle",
  schema: "./src/shared/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: dotenvConfig.DB_FILE_NAME,
  },
});

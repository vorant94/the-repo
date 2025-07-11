import { z } from "zod";

export const configSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: env variables have different convention
  BOT_TOKEN: z.string(),
  // biome-ignore lint/style/useNamingConvention: env variables have different convention
  DB_FILE_NAME: z.string().optional().default(":memory:"),
  // biome-ignore lint/style/useNamingConvention: env variables have different convention
  ROOT_USERNAME: z.string(),
  // biome-ignore lint/style/useNamingConvention: env variables have different convention
  ROOT_PASSWORD: z.string(),
  // biome-ignore lint/style/useNamingConvention: env variables have different convention
  TMDB_AUTH_TOKEN: z.string(),
});

export type Config = z.infer<typeof configSchema>;

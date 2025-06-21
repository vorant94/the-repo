import { parseArgs } from "node:util";
import { config } from "dotenv";
import { Bot } from "grammy";
import { z } from "zod";
import { configSchema } from "../src/shared/context/config.ts";

export const { baseUrl } = z
  .object({
    // .optional() doesn't work with .url(),
    // see here https://github.com/colinhacks/zod/discussions/2801
    baseUrl: z.union([z.string().trim().url(), z.literal("").optional()]),
  })
  .parse(
    parseArgs({
      options: {
        baseUrl: {
          type: "string",
        },
      },
    }).values,
  );

const { BOT_TOKEN } = configSchema
  .pick({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    BOT_TOKEN: true,
  })
  .parse(config().parsed);

const bot = new Bot(BOT_TOKEN);

await bot.api.setWebhook(
  baseUrl ? new URL("/api/telegram/webhook", baseUrl).toString() : "",
);

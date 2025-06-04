import { parseArgs } from "node:util";
import { config } from "dotenv";
import { Bot } from "grammy";
import { z } from "zod";
import { configSchema } from "../src/shared/env/config.ts";

export const { baseUrl } = z
  .object({
    baseUrl: z.string().url(),
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

await bot.api.setWebhook(new URL("/api/telegram/webhook", baseUrl).toString());

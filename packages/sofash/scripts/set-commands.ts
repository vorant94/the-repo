import { config } from "dotenv";
import { Bot } from "grammy";
import { command } from "../src/shared/env/command.ts";
import { configSchema } from "../src/shared/env/config.ts";

const env = configSchema
  .pick({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    BOT_TOKEN: true,
  })
  .parse(config().parsed);

const bot = new Bot(env.BOT_TOKEN);

await bot.api.setMyCommands([
  { command: command.health, description: "Health Check" },
  { command: command.addChain, description: "Add New Chain" },
]);

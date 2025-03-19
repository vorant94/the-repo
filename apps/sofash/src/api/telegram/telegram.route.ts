import { webhookCallback } from "grammy";
import { Hono } from "hono";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { chainsComposer } from "./chains.composer.tsx";
import { healthComposer } from "./health.composer.tsx";

export const telegramRoute = new Hono<HonoEnv>();

telegramRoute.use("/", (hc) => {
  const { bot } = hc.var;

  bot.use(healthComposer);
  bot.use(chainsComposer);

  return webhookCallback(bot, "cloudflare-mod")(hc.req.raw);
});

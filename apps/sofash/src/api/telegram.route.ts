import { webhookCallback } from "grammy";
import { Hono } from "hono";
import type { HonoEnv } from "../shared/env/hono-env.ts";
import { chainsComposer } from "./telegram/chains.composer.tsx";
import { healthComposer } from "./telegram/health.composer.tsx";

export const telegramRoute = new Hono<HonoEnv>();

telegramRoute.post("/webhook", (hc) => {
  const { bot } = hc.var;

  bot.use(healthComposer);
  bot.use(chainsComposer);

  return webhookCallback(bot, "cloudflare-mod")(hc.req.raw);
});

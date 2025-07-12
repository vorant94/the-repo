import { webhookCallback } from "grammy";
import { Hono } from "hono";
import { getContext } from "../../shared/context/context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { healthComposer } from "./health.composer.tsx";

export const telegramRoute = new Hono<HonoEnv>();

telegramRoute.post("/webhook", (hc) => {
  const { bot } = getContext();

  bot.use(healthComposer);

  return webhookCallback(bot, "cloudflare-mod")(hc.req.raw);
});

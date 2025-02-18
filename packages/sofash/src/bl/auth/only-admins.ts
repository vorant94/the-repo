import type { MiddlewareFn } from "grammy";
import type { MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import { getContext } from "hono/context-storage";
import type { GrammyContext } from "../../shared/env/grammy-context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";

export const hOnlyAdmins: MiddlewareHandler<HonoEnv> = (hc, next) => {
  const { config } = hc.var;

  return basicAuth({
    username: config.ADMIN_USERNAME,
    password: config.ADMIN_PASSWORD,
  })(hc, next);
};

export const gOnlyAdmins: MiddlewareFn<GrammyContext> = async (gc, next) => {
  const { user } = getContext<HonoEnv>().var;

  if (user.role !== "admin") {
    return gc.reply("Only admins can run this command.");
  }

  return await next();
};

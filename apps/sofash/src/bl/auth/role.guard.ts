import type { MiddlewareFn } from "grammy";
import { getContext } from "hono/context-storage";
import type { GrammyContext } from "../../shared/env/grammy-context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import type { UserRole } from "../../shared/schema/users.ts";

export const roleGuard = (role: UserRole): MiddlewareFn<GrammyContext> => {
  return async (gc, next) => {
    const { user } = getContext<HonoEnv>().var;

    if (user.role !== role) {
      return gc.reply(`Only [${role}] can run this command.`);
    }

    return await next();
  };
};

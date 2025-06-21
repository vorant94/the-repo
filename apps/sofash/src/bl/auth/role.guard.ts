import type { MiddlewareFn } from "grammy";
import { getAuthenticatedContext } from "../../shared/context/context.ts";
import type { UserRole } from "../../shared/schema/users.ts";
import type { GrammyContext } from "../../shared/telegram/grammy-context.ts";

export const roleGuard = (role: UserRole): MiddlewareFn<GrammyContext> => {
  return async (gc, next) => {
    const { user } = getAuthenticatedContext();

    if (user.role !== role) {
      return gc.reply(`Only [${role}] can run this command.`);
    }

    return await next();
  };
};

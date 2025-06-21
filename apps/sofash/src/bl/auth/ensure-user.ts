import type { MiddlewareFn } from "grammy";
import { upsertUser } from "../../dal/db/users.table.ts";
import { patchContext } from "../../shared/env/context.ts";
import type { GrammyContext } from "../../shared/env/grammy-context.ts";

export const ensureUser: MiddlewareFn<GrammyContext> = async (gc, next) => {
  if (!gc.chat) {
    throw new Error("Expect chat to be defined!");
  }

  const user = await upsertUser({ telegramChatId: gc.chat.id });
  patchContext({ user });

  await next();
};

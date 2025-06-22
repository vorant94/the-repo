import type { MiddlewareFn } from "grammy";
import { upsertUser } from "../../dal/db/users.table.ts";
import { runWithinPatchedContext } from "../../shared/context/context.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import type { GrammyContext } from "../../shared/telegram/grammy-context.ts";

export const ensureUser: MiddlewareFn<GrammyContext> = async (gc, next) => {
  using logger = createLogger("ensureUser");

  if (!gc.chat) {
    throw new Error("Expect chat to be defined!");
  }

  const user = await upsertUser({ telegramChatId: gc.chat.id });

  await runWithinPatchedContext({ user }, async () => {
    logger.info("context is authenticated, user id is", user.id);
    await next();
  });
};

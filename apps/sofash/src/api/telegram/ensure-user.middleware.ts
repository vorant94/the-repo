import type { MiddlewareFn } from "grammy";
import { upsertUserByTelegramChatId } from "../../dal/db/users.table.ts";
import { runWithinPatchedContext } from "../../shared/context/context.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import type { GrammyContext } from "../../shared/telegram/grammy-context.ts";

export const ensureUserMiddleware: MiddlewareFn<GrammyContext> = async (
  gc,
  next,
) => {
  using logger = createLogger("ensureUser");

  if (!gc.chat) {
    await gc.reply("Expect chat to be defined!");
    return;
  }

  try {
    const user = await upsertUserByTelegramChatId({
      telegramChatId: gc.chat.id,
    });

    await runWithinPatchedContext({ user }, async () => {
      logger.info("context is authenticated, user id is", user.id);
      await next();
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    await gc.reply(message);
  }
};

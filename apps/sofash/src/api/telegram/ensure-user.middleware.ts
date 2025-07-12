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

  const user = await upsertUserByTelegramChatId({ telegramChatId: gc.chat.id });

  await user.match(
    (user) =>
      runWithinPatchedContext({ user }, async () => {
        logger.info("context is authenticated, user id is", user.id);
        await next();
      }),
    (error) => gc.reply(error.message),
  );
};

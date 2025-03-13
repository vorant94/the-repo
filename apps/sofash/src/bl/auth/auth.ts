import { createUser, findUserByTelegramChatId } from "@/dal/db/users.table.ts";
import type { GrammyContext } from "@/shared/env/grammy-context.ts";
import type { HonoEnv } from "@/shared/env/hono-env.ts";
import type { MiddlewareFn } from "grammy";
import { getContext } from "hono/context-storage";

export const auth: MiddlewareFn<GrammyContext> = async (gc, next) => {
  const hc = getContext<HonoEnv>();

  if (!gc.chat) {
    throw new Error("Expect chat to be defined!");
  }

  const user =
    (await findUserByTelegramChatId(gc.chat.id)) ??
    (await createUser({ telegramChatId: gc.chat.id }));
  hc.set("user", user);

  await next();
};

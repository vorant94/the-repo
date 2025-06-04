import type { MiddlewareFn } from "grammy";
import { getContext } from "hono/context-storage";
import { upsertUser } from "../../dal/db/users.table.ts";
import type { GrammyContext } from "../../shared/env/grammy-context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";

export const ensureUser: MiddlewareFn<GrammyContext> = async (gc, next) => {
  const hc = getContext<HonoEnv>();

  if (!gc.chat) {
    throw new Error("Expect chat to be defined!");
  }

  const user = await upsertUser({ telegramChatId: gc.chat.id });
  hc.set("user", user);

  await next();
};

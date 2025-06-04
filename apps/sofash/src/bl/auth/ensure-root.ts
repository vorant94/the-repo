import type { Context, MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import { rootUserChatId, upsertUser } from "../../dal/db/users.table.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";

export const ensureRoot: MiddlewareHandler<HonoEnv> = (hc, next) => {
  return basicAuth({
    // reimplementing verification as a hack to set user to context once he is
    // authenticated
    verifyUser: async (username, password, hc) => {
      const { config } = (hc as Context<HonoEnv>).var;

      const isEqual =
        username === config.ROOT_USERNAME && password === config.ROOT_PASSWORD;
      if (!isEqual) {
        return false;
      }

      const user = await upsertUser({
        telegramChatId: rootUserChatId,
        role: "root",
      });
      hc.set("user", user);

      return true;
    },
  })(hc, next);
};

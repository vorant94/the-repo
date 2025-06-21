import type { MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import { rootUserChatId, upsertUser } from "../../dal/db/users.table.ts";
import { getContext, patchContext } from "../../shared/context/context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { createLogger } from "../../shared/logger/logger.ts";

export const ensureRoot: MiddlewareHandler<HonoEnv> = (hc, next) => {
  return basicAuth({
    // reimplementing verification as a hack to set user to context once he is
    // authenticated
    verifyUser: async (username, password) => {
      using logger = createLogger("ensureRoot.verifyUser");

      const { config } = getContext();

      const isEqual =
        username === config.ROOT_USERNAME && password === config.ROOT_PASSWORD;
      if (!isEqual) {
        return false;
      }

      const user = await upsertUser({
        telegramChatId: rootUserChatId,
        role: "root",
      });
      patchContext({ user });
      logger.info("context is authenticated, user id is", user.id);

      return true;
    },
  })(hc, next);
};

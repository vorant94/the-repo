import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";

export const jwtMiddleware: MiddlewareHandler<HonoEnv> = (c, next) => {
  const { env } = getAppContext();
  const verifyJwt = jwt({ alg: "HS256", secret: env.JWT_SECRET });

  return verifyJwt(c, next);
};

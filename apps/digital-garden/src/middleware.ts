import { defineMiddleware, sequence } from "astro:middleware";
import { dbConfig } from "./globals/db";
import { setSessionCookie, validateSessionToken } from "./lib/sessions";
import { findUserById } from "./lib/users";

const defineMiddlewarePrerenderFalse: typeof defineMiddleware = (fn) => {
  return defineMiddleware((context, next) => {
    if (context.isPrerendered) {
      return next();
    }

    return fn(context, next);
  });
};

const setupDb = defineMiddlewarePrerenderFalse(async (ctx, next) => {
  const { drizzle } = await import("drizzle-orm/d1");
  ctx.locals.db = drizzle(ctx.locals.runtime.env.DB, dbConfig);

  return next();
});

const setupAuth = defineMiddlewarePrerenderFalse(async (ctx, next) => {
  const sessionToken = ctx.cookies.get("session")?.value;

  const [session, validatedAtWasUpdated] = sessionToken
    ? await validateSessionToken(ctx, sessionToken)
    : [null, false];
  ctx.locals.session = session;
  if (sessionToken && validatedAtWasUpdated) {
    setSessionCookie(ctx, sessionToken);
  }

  ctx.locals.user = ctx.locals.session
    ? await findUserById(ctx, ctx.locals.session.userId)
    : null;

  return next();
});

const setContentSecurityPolicy = defineMiddlewarePrerenderFalse(
  async (_ctx, next) => {
    const response = await next();
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline'; frame-ancestors 'none'; frame-src 'none'; script-src 'self' 'unsafe-inline' static.cloudflareinsights.com data:; img-src 'self' data: w3.org/svg/2000 https://avatars.githubusercontent.com;",
    );

    return response;
  },
);

export const onRequest = sequence(setupDb, setupAuth, setContentSecurityPolicy);

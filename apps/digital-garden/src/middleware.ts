import { DB_FILE_NAME } from "astro:env/server";
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
  if (import.meta.env.DEV) {
    const { drizzle } = await import("drizzle-orm/libsql");
    ctx.locals.db = drizzle(DB_FILE_NAME, dbConfig);
  } else {
    const { drizzle } = await import("drizzle-orm/d1");
    ctx.locals.db = drizzle(ctx.locals.runtime.env.DB, dbConfig);
  }

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

export const onRequest = sequence(setupDb, setupAuth);

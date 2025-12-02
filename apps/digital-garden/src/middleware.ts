import { DB_FILE_NAME } from "astro:env/server";
import { defineMiddleware, sequence } from "astro:middleware";
import { dbConfig } from "./globals/db";
import { validateSessionToken } from "./lib/sessions";

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

const setupSession = defineMiddlewarePrerenderFalse(async (ctx, next) => {
  const sessionToken = ctx.cookies.get("session")?.value;

  ctx.locals.session = sessionToken
    ? await validateSessionToken(ctx, sessionToken)
    : null;

  return next();
});

export const onRequest = sequence(setupDb, setupSession);

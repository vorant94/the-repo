import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Bot } from "grammy";
import type { User } from "../schema/users.ts";
import type { GrammyContext } from "../telegram/grammy-context.ts";
import type { Config } from "./config.ts";

export interface Context {
  requestId: string;
  config: Config;
  bot: Bot<GrammyContext>;
  db: DrizzleD1Database | LibSQLDatabase;
  user?: User;
}

export interface RawContext
  extends Partial<Omit<Context, "requestId">>,
    Pick<Context, "requestId"> {}

// export interface AuthenticatedContext
//   extends Omit<Context, "user">,
//     Required<Pick<Context, "user">> {}

export function getRawContext(): RawContext {
  const context = storage.getStore();
  if (!context) {
    throw new Error("Context is not available");
  }

  return context;
}

// reimplementing context storage instead of using hono's built-in one in order
// to utilize it outside hono like in scripts
export function getContext(): Context {
  const context = getRawContext();
  if (!isContext(context)) {
    throw new Error("Context is not valid");
  }

  return context;
}

// export function getAuthenticatedContext(): AuthenticatedContext {
//   const context = getContext();
//   if (!isAuthenticatedContext(context)) {
//     throw new Error("Context is not authenticated");
//   }

//   return context;
// }

export function runWithinContext<T>(
  context: Partial<Omit<Context, "requestId">>,
  callback: () => T,
): T {
  const requestId = randomUUID();

  return storage.run({ ...context, requestId }, callback);
}

// cannot simply use storage.enterWith since it isn't implemented in CF Workers
export function runWithinPatchedContext<T>(
  context: Partial<Omit<Context, "requestId">>,
  callback: () => T,
): T {
  const prevContext = getRawContext();
  return storage.run({ ...prevContext, ...context }, callback);
}

const storage = new AsyncLocalStorage<RawContext>();

// implementing manual simplified validation instead of zod schema in order to
// leave imports from drizzle-orm/d1 and drizzle-orm/libsql as type-only imports
// and therefore load only one of them based on environment. otherwise using
// z.instanceOf requires to actually load both used classes at the same time
function isContext(context: RawContext): context is Context {
  return "config" in context && "bot" in context && "db" in context;
}

// function isAuthenticatedContext(
//   context: Context,
// ): context is AuthenticatedContext {
//   return "user" in context;
// }

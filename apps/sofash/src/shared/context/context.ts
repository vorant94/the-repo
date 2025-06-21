import { AsyncLocalStorage } from "node:async_hooks";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Bot } from "grammy";
import type { User } from "../schema/users.ts";
import type { GrammyContext } from "../telegram/grammy-context.ts";
import type { Config } from "./config.ts";

export interface Context {
  config: Config;
  bot: Bot<GrammyContext>;
  db: DrizzleD1Database | LibSQLDatabase;
  user?: User;
  requestId: string;
}

export interface AuthenticatedContext
  extends Omit<Context, "user">,
    Required<Pick<Context, "user">> {}

// reimplementing context storage instead of using hono's built-in one in order
// to utilize it outside hono like in scripts
export function getContext(): Context {
  const context = storage.getStore();
  if (!context) {
    throw new Error("Context is not available");
  }

  return context;
}

export function getAuthenticatedContext(): AuthenticatedContext {
  const context = getContext();
  if (!isAuthenticatedContext(context)) {
    throw new Error("Context is not authenticated");
  }

  return context;
}

export function runWithinContext<T>(context: Context, callback: () => T): T {
  return storage.run(context, callback);
}

export function patchContext(context: Partial<Context>): void {
  const prevContext = getContext();
  storage.enterWith({ ...prevContext, ...context });
}

const storage = new AsyncLocalStorage<Context>();

function isAuthenticatedContext(
  context: Context,
): context is AuthenticatedContext {
  return "user" in context;
}

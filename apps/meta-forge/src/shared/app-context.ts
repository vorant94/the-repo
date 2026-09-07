import { AsyncLocalStorage } from "node:async_hooks";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Env } from "./env.ts";
import type { EventReport } from "./schema/jobs.ts";

export interface AppContext {
  db: DrizzleD1Database<Record<string, unknown>>;
  env: Env;
  eventReport?: EventReport;
}

const appContextStorage = new AsyncLocalStorage<AppContext>();

export function getAppContext(): AppContext {
  const context = appContextStorage.getStore();
  if (!context) {
    throw new Error("Application context is not available");
  }

  return context;
}

export function runWithAppContext<Result>(
  context: AppContext,
  callback: () => Result,
): Result {
  return appContextStorage.run(context, callback);
}

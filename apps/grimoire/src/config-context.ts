import { AsyncLocalStorage } from "node:async_hooks";
import type { Config } from "./schemas/config.ts";

export const configContext = new AsyncLocalStorage<Config>();

export function getConfig(): Config {
  const config = configContext.getStore();
  if (!config) {
    throw new Error("Config context is not initialized");
  }
  return config;
}

import { AsyncLocalStorage } from "node:async_hooks";

export interface SpectateContext {
  url: string;
  model: string;
  llmApiKey: string;
  debugDir?: string;
}

export function getContext(): SpectateContext {
  const context = storage.getStore();
  if (!context) {
    throw new Error("Spectate context is not available");
  }

  return context;
}

export function runWithinContext<T>(
  context: SpectateContext,
  callback: () => T,
): T {
  return storage.run(context, callback);
}

const storage = new AsyncLocalStorage<SpectateContext>();

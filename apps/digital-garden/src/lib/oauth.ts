const providers = ["github"] as const;
export type Provider = (typeof providers)[number];

export function isProvider(maybeProvider: string): maybeProvider is Provider {
  return providers.includes(maybeProvider);
}

export const resourceTypes = ["chain", "user", "site"] as const;

export type ResourceType = (typeof resourceTypes)[number];

export const resourceType = {
  chain: "chain",
  site: "site",
  user: "user",
} as const satisfies Record<ResourceType, ResourceType>;

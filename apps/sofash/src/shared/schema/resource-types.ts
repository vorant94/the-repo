export const resourceTypes = ["chain", "user", "site", "release"] as const;

export type ResourceType = (typeof resourceTypes)[number];

export const resourceType = {
  chain: "chain",
  site: "site",
  user: "user",
  release: "release",
} as const satisfies Record<ResourceType, ResourceType>;

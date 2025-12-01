const resourceTypes = ["chain", "user", "site", "release", "title"] as const;

export type ResourceType = (typeof resourceTypes)[number];

export const resourceType = {
  chain: "chain",
  site: "site",
  user: "user",
  release: "release",
  title: "title",
} as const satisfies Record<ResourceType, ResourceType>;

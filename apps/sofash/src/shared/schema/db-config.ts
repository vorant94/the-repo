import type { DrizzleConfig } from "drizzle-orm";

export const dbConfig = {
  casing: "snake_case",
} as const satisfies DrizzleConfig;

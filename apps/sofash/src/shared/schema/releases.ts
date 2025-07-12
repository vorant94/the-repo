import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { chains } from "./chains.ts";
import { resourceType } from "./resource-types.ts";
import { titles } from "./titles.ts";

export const releases = sqliteTable("releases", {
  id: text().primaryKey(),
  resourceType: text({ enum: [resourceType.release] })
    .notNull()
    .default(resourceType.release),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  chainId: text()
    .notNull()
    .references(() => chains.id),
  externalId: text().notNull(),
  titleId: text()
    .notNull()
    .references(() => titles.id),
});

export const releaseSchema = createSelectSchema(releases);

export type Release = z.infer<typeof releaseSchema>;

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRelease = z.infer<typeof insertReleaseSchema>;

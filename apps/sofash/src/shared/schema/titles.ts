import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { resourceType } from "./resource-types.ts";

export const titles = sqliteTable("titles", {
  id: text().primaryKey(),
  resourceType: text({ enum: [resourceType.release] })
    .notNull()
    .default(resourceType.release),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  name: text().notNull(),
  externalId: text().notNull(),
});

export const titleSchema = createSelectSchema(titles);

export type Title = z.infer<typeof titleSchema>;

export const insertTitleSchema = createInsertSchema(titles).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTitle = z.infer<typeof insertTitleSchema>;

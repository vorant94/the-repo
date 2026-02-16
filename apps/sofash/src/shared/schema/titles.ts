import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { resourceType } from "./resource-types.ts";

export const titles = sqliteTable("titles", {
  id: text().primaryKey(),
  resourceType: text({ enum: [resourceType.title] })
    .notNull()
    .default(resourceType.title),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  name: text().notNull(),
  releasedAt: text().notNull(),
  // TMDB id
  externalId: text().notNull(),
});

export type RawTitle = typeof titles.$inferSelect;

export const titleSchema = createSelectSchema(titles, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  releasedAt: z.coerce.date(),
});

export type Title = z.infer<typeof titleSchema>;

export const insertTitleSchema = createInsertSchema(titles, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  releasedAt: z.coerce.date(),
}).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTitle = z.infer<typeof insertTitleSchema>;

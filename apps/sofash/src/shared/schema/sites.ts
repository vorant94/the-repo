import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { chains } from "./chains.ts";
import { resourceType } from "./resource-types.ts";

export const sites = sqliteTable("sites", {
  id: text()
    .primaryKey()
    .$default(() => randomUUID()),
  resourceType: text({ enum: [resourceType.site] })
    .notNull()
    .default(resourceType.site),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  chainId: text()
    .notNull()
    .references(() => chains.id),
  externalId: text().notNull(),

  name: text().notNull(),
});

export const siteSchema = createSelectSchema(sites, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Site = z.infer<typeof siteSchema>;

export const insertSiteSchema = createInsertSchema(sites, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSite = z.infer<typeof insertSiteSchema>;

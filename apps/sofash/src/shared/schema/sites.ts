import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
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

  name: text().notNull(),
  siteId: text().notNull(),
  chainId: text()
    .notNull()
    .references(() => chains.id),
});

export const siteSchema = createSelectSchema(sites);

export type Site = z.infer<typeof siteSchema>;

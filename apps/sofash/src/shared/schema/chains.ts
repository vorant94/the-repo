import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { resourceType } from "./resource-types.ts";

export const chains = sqliteTable("chains", {
  id: text().primaryKey(),
  resourceType: text({ enum: [resourceType.chain] })
    .notNull()
    .default(resourceType.chain),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  name: text().notNull(),
  // quickbook chain id
  externalId: text().notNull(),
});

export type RawChain = typeof chains.$inferSelect;

export const chainSchema = createSelectSchema(chains, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Chain = z.infer<typeof chainSchema>;

export const insertChainSchema = createInsertSchema(chains, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChain = z.infer<typeof insertChainSchema>;

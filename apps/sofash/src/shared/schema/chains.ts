import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { resourceType } from "./resource-types.ts";

export const chainNames = ["rav-hen", "planet"] as const;
export type ChainName = (typeof chainNames)[number];

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

  name: text({ enum: chainNames }).unique().notNull(),
});

export const chainSchema = createSelectSchema(chains);

export type Chain = z.infer<typeof chainSchema>;

export const insertChainSchema = createInsertSchema(chains).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChain = z.infer<typeof insertChainSchema>;

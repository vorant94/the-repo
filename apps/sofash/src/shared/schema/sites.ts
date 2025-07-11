import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { chains } from "./chains.ts";
import { resourceType } from "./resource-types.ts";

export const ravHenSiteNames = [
  "givatayim",
  "dizengoff",
  "kiryat-ono",
] as const;
export type RavHenSiteName = (typeof ravHenSiteNames)[number];
export const ravHenSiteNameSchema = z.enum(ravHenSiteNames);

export const planetSiteNames = [
  "ayalon",
  "beer-sheva",
  "zichron-yaakov",
  "haifa",
  "jerusalem",
  "rishon-letziyon",
] as const;
export type PlanetSiteName = (typeof planetSiteNames)[number];
export const planetSiteNameSchema = z.enum(planetSiteNames);

export const siteNames = [...ravHenSiteNames, ...planetSiteNames] as const;
export type SiteName = (typeof siteNames)[number];
export const siteNameSchema = z.enum(siteNames);

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

  // TODO make uniqueness combined from name and chainId
  name: text({ enum: siteNames }).unique().notNull(),
  chainId: text()
    .notNull()
    .references(() => chains.id),
});

export const siteSchema = createSelectSchema(sites);

export type Site = z.infer<typeof siteSchema>;

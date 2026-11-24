import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.ts";

export const archetypes = sqliteTable(
  "archetypes",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: text()
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text()
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdateFn(() => new Date().toISOString()),
    createdBy: text().references(() => users.id, { onDelete: "restrict" }),
    updatedBy: text().references(() => users.id, { onDelete: "restrict" }),
    name: text().notNull(),
    aliases: text({ mode: "json" })
      .$type<Array<string>>()
      .notNull()
      .default(sql`'[]'`),
  },
  (table) => [uniqueIndex("archetypes_name_unique").on(table.name)],
);

const archetypeSchema = createSelectSchema(archetypes, {
  aliases: z.array(z.string()),
}).meta({
  ref: "ArchetypeInternal",
});

export const archetypeDtoSchema = archetypeSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Archetype" });

export const insertArchetypeSchema = createInsertSchema(archetypes, {
  aliases: z.array(z.string()),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  })
  .meta({ ref: "InsertArchetype" });

export const updateArchetypeSchema = insertArchetypeSchema.partial().meta({
  ref: "UpdateArchetype",
});

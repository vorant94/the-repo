import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

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
    name: text().notNull(),
  },
  (table) => [uniqueIndex("archetypes_name_unique").on(table.name)],
);

export const archetypeSchema = createSelectSchema(archetypes).meta({
  ref: "ArchetypeInternal",
});
export type Archetype = z.infer<typeof archetypeSchema>;

export const archetypeDtoSchema = archetypeSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Archetype" });
export type ArchetypeDto = z.infer<typeof archetypeDtoSchema>;

export const insertArchetypeSchema = createInsertSchema(archetypes)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertArchetype" });
export type InsertArchetype = z.infer<typeof insertArchetypeSchema>;

export const updateArchetypeSchema = insertArchetypeSchema.partial().meta({
  ref: "UpdateArchetype",
});
export type UpdateArchetype = z.infer<typeof updateArchetypeSchema>;

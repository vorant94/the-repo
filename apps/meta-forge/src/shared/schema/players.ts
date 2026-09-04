import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const players = sqliteTable(
  "players",
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
  (table) => [uniqueIndex("players_name_unique").on(table.name)],
);

export const playerSchema = createSelectSchema(players).meta({
  ref: "PlayerInternal",
});
export type Player = z.infer<typeof playerSchema>;

export const playerDtoSchema = playerSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Player" });
export type PlayerDto = z.infer<typeof playerDtoSchema>;

export const insertPlayerSchema = createInsertSchema(players)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertPlayer" });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export const updatePlayerSchema = insertPlayerSchema.partial().meta({
  ref: "UpdatePlayer",
});
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;

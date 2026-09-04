import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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

const playerSchema = createSelectSchema(players).meta({
  ref: "PlayerInternal",
});

export const playerDtoSchema = playerSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Player" });

export const insertPlayerSchema = createInsertSchema(players)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertPlayer" });

export const updatePlayerSchema = insertPlayerSchema.partial().meta({
  ref: "UpdatePlayer",
});

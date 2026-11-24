import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.ts";

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
    createdBy: text().references(() => users.id, { onDelete: "restrict" }),
    updatedBy: text().references(() => users.id, { onDelete: "restrict" }),
    name: text().notNull(),
    aliases: text({ mode: "json" })
      .$type<Array<string>>()
      .notNull()
      .default(sql`'[]'`),
  },
  (table) => [uniqueIndex("players_name_unique").on(table.name)],
);

const playerSchema = createSelectSchema(players, {
  aliases: z.array(z.string()),
}).meta({
  ref: "PlayerInternal",
});

export const playerDtoSchema = playerSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Player" });

export const insertPlayerSchema = createInsertSchema(players, {
  aliases: z.array(z.string()),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  })
  .meta({ ref: "InsertPlayer" });

export const updatePlayerSchema = insertPlayerSchema.partial().meta({
  ref: "UpdatePlayer",
});

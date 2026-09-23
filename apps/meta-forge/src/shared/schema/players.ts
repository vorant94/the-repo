import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const playerAddressSchema = z.object({ city: z.string() });
type PlayerAddress = z.infer<typeof playerAddressSchema>;

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
    aliases: text({ mode: "json" })
      .$type<Array<string>>()
      .notNull()
      .default(sql`'[]'`),
    address: text({ mode: "json" }).$type<PlayerAddress>(),
  },
  (table) => [uniqueIndex("players_name_unique").on(table.name)],
);

const playerSchema = createSelectSchema(players, {
  aliases: z.array(z.string()),
  address: playerAddressSchema.nullable(),
}).meta({
  ref: "PlayerInternal",
});

export const playerDtoSchema = playerSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Player" });

export const insertPlayerSchema = createInsertSchema(players, {
  aliases: z.array(z.string()),
  address: playerAddressSchema.nullable().optional(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertPlayer" });

export const updatePlayerSchema = insertPlayerSchema.partial().meta({
  ref: "UpdatePlayer",
});

import { sql } from "drizzle-orm";
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { archetypes } from "./archetypes.ts";
import { events } from "./events.ts";
import { players } from "./players.ts";

export const ranks = sqliteTable(
  "ranks",
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
    eventId: text()
      .notNull()
      .references(() => events.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    playerId: text()
      .notNull()
      .references(() => players.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    archetypeId: text()
      .notNull()
      .references(() => archetypes.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    position: integer().notNull(),
    wins: integer().notNull(),
    losses: integer().notNull(),
    draws: integer().notNull().default(0),
  },
  (table) => [
    uniqueIndex("ranks_event_player_unique").on(table.eventId, table.playerId),
    uniqueIndex("ranks_event_position_unique").on(
      table.eventId,
      table.position,
    ),
    check("ranks_position_positive", sql`${table.position} > 0`),
    check(
      "ranks_record_non_negative",
      sql`${table.wins} >= 0 AND ${table.losses} >= 0 AND ${table.draws} >= 0`,
    ),
  ],
);

export const rankSchema = createSelectSchema(ranks).meta({
  ref: "RankInternal",
});
export type Rank = z.infer<typeof rankSchema>;

export const rankDtoSchema = rankSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Rank" });
export type RankDto = z.infer<typeof rankDtoSchema>;

export const insertRankSchema = createInsertSchema(ranks)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertRank" });
export type InsertRank = z.infer<typeof insertRankSchema>;

export const updateRankSchema = insertRankSchema.partial().meta({
  ref: "UpdateRank",
});
export type UpdateRank = z.infer<typeof updateRankSchema>;

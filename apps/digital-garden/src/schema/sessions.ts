import { sql } from "drizzle-orm";
import { blob, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type z from "zod";
import { users } from "./users";

export const sessions = sqliteTable("sessions", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id),
  secretHash: blob({ mode: "buffer" }).notNull(),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const sessionSchema = createSelectSchema(sessions);
export type Session = z.infer<typeof sessionSchema>;

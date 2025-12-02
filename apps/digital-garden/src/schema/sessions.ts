import { sql } from "drizzle-orm";
import { blob, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type z from "zod";

export const sessions = sqliteTable("sessions", {
  id: text().primaryKey(),
  secretHash: blob({ mode: "buffer" }).notNull(),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const sessionSchema = createSelectSchema(sessions);
export type Session = z.infer<typeof sessionSchema>;

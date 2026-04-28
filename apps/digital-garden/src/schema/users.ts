import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type z from "zod";

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  githubId: integer().notNull(),
  username: text().notNull(),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const userSchema = createSelectSchema(users);
export type User = z.infer<typeof userSchema>;

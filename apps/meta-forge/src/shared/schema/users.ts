import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  isActive: integer({ mode: "boolean" }).notNull().default(true),
  isAdmin: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: text().notNull(),
});

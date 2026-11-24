import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.ts";

export const apiTokens = sqliteTable("api_tokens", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  secretHash: text().notNull(),
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  revokedAt: text(),
});

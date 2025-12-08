import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type z from "zod";
import { users } from "./users";

export const comments = sqliteTable("comments", {
  id: text().primaryKey(),
  authorId: text()
    .notNull()
    .references(() => users.id),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  postSlug: text().notNull(),
  text: text().notNull(),
});

export const commentSchema = createSelectSchema(comments);
export type Comment = z.infer<typeof commentSchema>;

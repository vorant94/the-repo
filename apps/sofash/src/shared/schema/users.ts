import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { resourceType } from "./resource-types.ts";

export const userRoles = ["root", "admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];

export const userRoleSchema = z.enum(userRoles);

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  resourceType: text({ enum: [resourceType.user] })
    .notNull()
    .default(resourceType.user),
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

  telegramChatId: integer().notNull().unique(),
  role: text({ enum: userRoles }).notNull().default("user"),
});

export const userSchema = createSelectSchema(users);

export type User = z.infer<typeof userSchema>;

export const upsertUserSchema = createInsertSchema(users).omit({
  id: true,
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;

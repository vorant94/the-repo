import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const hosts = sqliteTable(
  "hosts",
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
    address: text().notNull(),
  },
  (table) => [uniqueIndex("hosts_name_unique").on(table.name)],
);

export const hostSchema = createSelectSchema(hosts).meta({
  ref: "HostInternal",
});
export type Host = z.infer<typeof hostSchema>;

export const hostDtoSchema = hostSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Host" });
export type HostDto = z.infer<typeof hostDtoSchema>;

export const insertHostSchema = createInsertSchema(hosts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertHost" });
export type InsertHost = z.infer<typeof insertHostSchema>;

export const updateHostSchema = insertHostSchema.partial().meta({
  ref: "UpdateHost",
});
export type UpdateHost = z.infer<typeof updateHostSchema>;

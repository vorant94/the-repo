import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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

const hostSchema = createSelectSchema(hosts).meta({
  ref: "HostInternal",
});

export const hostDtoSchema = hostSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Host" });

export const insertHostSchema = createInsertSchema(hosts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertHost" });

export const updateHostSchema = insertHostSchema.partial().meta({
  ref: "UpdateHost",
});

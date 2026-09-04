import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { hosts } from "./hosts.ts";

export const events = sqliteTable("events", {
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
  hostedAt: text().notNull(),
  hostedBy: text()
    .notNull()
    .references(() => hosts.id, { onDelete: "restrict", onUpdate: "cascade" }),
});

const eventSchema = createSelectSchema(events, {
  hostedAt: z.iso.datetime({ offset: true }),
}).meta({ ref: "EventInternal" });

export const eventDtoSchema = eventSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Event" });

export const insertEventSchema = createInsertSchema(events, {
  hostedAt: z.iso.datetime({ offset: true }),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertEvent" });

export const updateEventSchema = insertEventSchema.partial().meta({
  ref: "UpdateEvent",
});

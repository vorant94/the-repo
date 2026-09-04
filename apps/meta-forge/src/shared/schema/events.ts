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

export const eventSchema = createSelectSchema(events, {
  hostedAt: z.iso.datetime(),
}).meta({ ref: "EventInternal" });
export type Event = z.infer<typeof eventSchema>;

export const eventDtoSchema = eventSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Event" });
export type EventDto = z.infer<typeof eventDtoSchema>;

export const insertEventSchema = createInsertSchema(events, {
  hostedAt: z.iso.datetime(),
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertEvent" });
export type InsertEvent = z.infer<typeof insertEventSchema>;

export const updateEventSchema = insertEventSchema.partial().meta({
  ref: "UpdateEvent",
});
export type UpdateEvent = z.infer<typeof updateEventSchema>;

import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const venues = sqliteTable(
  "venues",
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
  (table) => [uniqueIndex("venues_name_unique").on(table.name)],
);

const venueSchema = createSelectSchema(venues).meta({
  ref: "VenueInternal",
});

export const venueDtoSchema = venueSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Venue" });

export const insertVenueSchema = createInsertSchema(venues)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertVenue" });

export const updateVenueSchema = insertVenueSchema.partial().meta({
  ref: "UpdateVenue",
});

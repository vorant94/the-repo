import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const venueAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
});
export type VenueAddress = z.infer<typeof venueAddressSchema>;

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
    address: text({ mode: "json" }).$type<VenueAddress>().notNull(),
  },
  (table) => [uniqueIndex("venues_name_unique").on(table.name)],
);

const venueSchema = createSelectSchema(venues, {
  address: venueAddressSchema,
}).meta({
  ref: "VenueInternal",
});

export const venueDtoSchema = venueSchema
  .omit({ createdAt: true, updatedAt: true })
  .meta({ ref: "Venue" });

export const insertVenueSchema = createInsertSchema(venues, {
  address: venueAddressSchema,
})
  .omit({ id: true, createdAt: true, updatedAt: true })
  .meta({ ref: "InsertVenue" });

export const updateVenueSchema = insertVenueSchema.partial().meta({
  ref: "UpdateVenue",
});

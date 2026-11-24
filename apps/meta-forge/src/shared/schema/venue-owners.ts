import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.ts";
import { venues } from "./venues.ts";

export const venueOwners = sqliteTable(
  "venue_owners",
  {
    venueId: text()
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
  },
  (table) => [primaryKey({ columns: [table.venueId, table.userId] })],
);

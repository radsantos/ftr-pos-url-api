import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    original_url: text("original_url").notNull(),
    short_code: varchar("short_code", { length: 64 }).notNull(),
    access_count: integer("access_count").notNull().default(0),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueShortCode: unique("unique_short_code").on(table.short_code),
  })
);

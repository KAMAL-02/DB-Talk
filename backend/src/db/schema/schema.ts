import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const dbSourceEnum = pgEnum("db_source", ["postgres", "mongo"]);
export const dbModeEnum = pgEnum("db_mode", ["url", "parts"]);

export const databaseConnections = pgTable(
  "database_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: dbSourceEnum("source").notNull(),
    mode: dbModeEnum("mode").notNull(),
    dbName: text("db_name").notNull(),
    dbCredentials: jsonb("db_credentials").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqDbNamePerSource: uniqueIndex("uniq_dbname_per_source").on(
      table.source,
      table.dbName
    ),
  })
);

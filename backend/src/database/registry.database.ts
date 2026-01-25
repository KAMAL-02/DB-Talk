/** Single source of all the registered database
 * it maps the name of the database to its adapter and contains a getter function to get the adapter
 * current supported database
 *  - Postgres
 *  - Mongo
 */

import { mongoAdapter } from "./adapters/mongo/mongo.adapters.js";
import { postgresAdapter } from "./adapters/postgres/postgres.adapters.js";
import type { DatabaseAdapter } from "../types.js";

export const databaseRegistry: Record<string, DatabaseAdapter> = {
  postgres: postgresAdapter,
  mongo: mongoAdapter,
};

export const getDatabaseAdapter = (source: string): DatabaseAdapter => {
  const adapter = databaseRegistry[source];
  if (!adapter) {
    throw new Error(`${source} not supported`);
  }
  return adapter;
};

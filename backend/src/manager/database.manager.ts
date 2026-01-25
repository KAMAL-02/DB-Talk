import type { DatabaseCredentialsBody, DatabaseAdapter } from "../types.js";
import * as cryptoUtil from "../utils/crypto.util.js";
import * as redisService from "../services/redis/redis.service.js";
import type { Redis } from "ioredis";
import { getDatabaseAdapter } from "../database/registry.database.js";
import { databaseConnections } from "../db/schema/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { getPool } from "./pool.manager.js";

/** Test the database credentials and redirect to correct db adapter */
const testConnection = async ({
  credentials,
  redis,
}: {
  credentials: DatabaseCredentialsBody;
  redis: Redis;
}) => {
  /** Get the correct adapter and test the connection */
  const { source, mode, ...dbCred } = credentials;
  const adapter = getDatabaseAdapter(source);
  await adapter.testConnection(credentials);

  /** Encrypt the database credentials and store in redis for saving the connection in future
   * Redis only stores the source and database credentials when testing the connection
   */
  const databaseId = cryptoUtil.generateDatabaseId({ source, dbCred });

  const encryptedCredentials = cryptoUtil.encryptObject(dbCred);
  if (!encryptedCredentials) {
    throw new Error("Failed to encrypt database credentials");
  }

  await redisService.cacheDbCredentials(
    redis,
    databaseId,
    encryptedCredentials,
  );

  return { databaseId };
};

/** Get the cached schema from the redis and save in the application database */
const saveDatabaseCredentials = async ({
  database,
  db,
  redis,
}: {
  database: object;
  db: any;
  redis: Redis;
}) => {
  /** Get the cached db credentials from Redis */
  const { databaseId, dbName, source, mode } = database as any;
  const cachedData = await redisService.getCachedDbCredentials(
    redis,
    databaseId,
  );
  console.log("Decrypted cached data:", cachedData);

  if (!cachedData) {
    throw new Error(
      "No configuration found for the provided database, please try again",
    );
  }

  const existing = await db
    .select()
    .from(databaseConnections)
    .where(
      and(
        eq(databaseConnections.source, source),
        eq(databaseConnections.dbName, dbName),
      ),
    );

  if (existing.length > 0) {
    throw new Error("Database with the same name already exists");
  }
  /** If no existing database with the same name, insert the new database in encrypted format*/
  try {
    await db.insert(databaseConnections).values({
      source,
      mode,
      dbName,
      dbCredentials: cachedData,
    });
  } catch (error) {
    console.log("Error inserting database credentials:", error);
    throw new Error("Failed to save database credentials");
  }
  await redisService.clearCachedDbCredentials(redis, databaseId);
};

/** Connect Manager takes databaseId and connects to the database
 * By connect means it creates the pool for the database and introspects the schema ( fetching db metadata )
 * The introspected schema is then cached in Redis for future use ( querying )
 */
const connectDatabase = async ({
  databaseId,
  db,
  redis,
}: {
  databaseId: string;
  db: any;
  redis: Redis;
}) => {
  let adapter: DatabaseAdapter | null = null;

  try {
    /** Get the database record based on database Id */
    const record = await db
      .select()
      .from(databaseConnections)
      .where(eq(databaseConnections.id, databaseId));

    if (!record.length) {
      throw new Error("Database configuration not found");
    }

    const config = record[0];

    /** Database records connection configs in encrypted manner
     * so it needs decryption before use
     */
    const decrypted = cryptoUtil.decryptObject(config.dbCredentials) as any;

    if (!decrypted) {
      throw new Error("Failed to decrypt database credentials");
    }

    /** Call the correct adapter and use its connect method */
    adapter = getDatabaseAdapter(config.source);

    await adapter.connect(databaseId, {
      source: config.source,
      mode: config.mode,
      dbCredentials: decrypted.dbCredentials,
    });

    /** Introspect the schema and cache it in Redis for future use ( querying ) */
    const schema = await adapter.introspectSchema(databaseId);

    await redisService.cacheSchema(redis, databaseId, schema);

    return {
      databaseId,
      dbName: config.dbName,
      source: config.source,
    };
  } catch (err) {
    /** In case of any error disconnect and clear the redis cache */
    if (adapter) {
      await adapter.disconnect(databaseId);
    }
    await redisService.clearCachedSchema(redis, databaseId);

    throw err;
  }
};

/** Delete the database based on database Id */
const deleteDatabases = async ({
  databaseIds,
  db,
  redis,
}: {
  databaseIds: string[];
  db: any;
  redis: any;
}): Promise<number> => {
  // Fetch records first
  const records = await db
    .select()
    .from(databaseConnections)
    .where(inArray(databaseConnections.id, databaseIds));

  if (records.length === 0) return 0;

  // Delete from DB
  const result = await db
    .delete(databaseConnections)
    .where(inArray(databaseConnections.id, databaseIds));

  // Cleanup per database
  for (const record of records) {
    await redisService.clearCachedSchema(redis, record.id);

    try {
      const adapter = getDatabaseAdapter(record.source);
      await adapter.disconnect(record.id);
    } catch (err) {
      console.log(`Cleanup failed for ${record.source}:${record.id}`, err);
    }
  }
  return result.rowCount ?? 0;
};

/** Disconnect the database and clear its cached schema */
const disconnectDatabase = async ({
  databaseId,
  db,
  redis,
}: {
  databaseId: string;
  db: any;
  redis: Redis;
}) => {
  /** Fetch the record based on database Id  */
  const record = await db
    .select()
    .from(databaseConnections)
    .where(eq(databaseConnections.id, databaseId));

  if (!record || record.length === 0) {
    throw new Error("Database configuration not found");
  }

  /** Based on source call the correct adapter and disconnect */
  const source = record[0]?.source;
  if (!source) {
    throw new Error("Database source is missing");
  }

  const adapter = getDatabaseAdapter(source);
  try {
    await adapter.disconnect(databaseId);
  } catch (error) {
    console.log(`Error disconnecting from database ${databaseId}:`, error);
  }
  /** Irrespective of success or error clear the cached schema in Redis */
  await redisService.clearCachedSchema(redis, databaseId);
};

/** It takes active databaseId, gets source and executes the query on active pool */
const executeQuery = async (databaseId: string, query: string, db: any) => {
  // Fetch database record
  const records = await db
    .select()
    .from(databaseConnections)
    .where(eq(databaseConnections.id, databaseId));

  if (records.length === 0) {
    throw new Error("Database configuration not found");
  }

  const source = records[0]?.source;
  if (!source) {
    throw new Error("Database source is missing");
  }

  // Get the appropriate adapter for the database type
  const adapter = getDatabaseAdapter(source);

  // Get the active connection pool for this database
  const activePool = getPool<any>(databaseId);
  if (!activePool) {
    throw new Error("No active connection pool found for this database");
  }

  // Execute query through the adapter
  const result = await adapter.executeQuery(query, activePool);
  return result;
};

export {
  testConnection,
  saveDatabaseCredentials,
  connectDatabase,
  deleteDatabases,
  disconnectDatabase,
  executeQuery,
};

import type { RouteHandler } from "fastify";
import type {
  connectDb,
  DatabaseCredentialsBody,
  saveDbCredentials,
  JWTPayload,
} from "../types.js";
import * as postgresService from "../services/database/postgres.service.js";
import * as redisService from "../services/redis.service.js";
import * as cryptoUtil from "../utils/crypto.util.js";
import { databaseConnections } from "../db/schema/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { buildConnectionConfig, extractDbName } from "../utils/cred.util.js";
import { normalizePgSchema } from "../utils/introspection.util.js";

export const testConnectionHandler: RouteHandler<{
  Body: DatabaseCredentialsBody;
}> = async (request, reply) => {
  const { source, mode, ...dbCred } = request.body;
  console.log("request body:", request.body);
  if (source === "postgres") {
    try {
      await postgresService.testPostgresConnection(request.body);
      const databaseId = cryptoUtil.generateDatabaseId({ source, dbCred });
      const encryptedCredentials = cryptoUtil.encryptObject(dbCred);
      if (!encryptedCredentials) {
        return reply
          .status(500)
          .send({
            success: false,
            error: "Failed to encrypt database credentials",
          });
      }
      redisService.cacheDbCredentials(
        request.server.redis,
        databaseId,
        encryptedCredentials
      );
      return reply
        .status(200)
        .send({
          success: true,
          message: "Configuration validated",
          data: { databaseId },
        });
    } catch (error) {
      request.server.log.error(error, "Postgres connection test failed");
      if (error instanceof Error)
        return reply
          .status(500)
          .send({
            success: false,
            error: error.message ?? "Failed to connect to Postgres database",
          });
      return reply
        .status(500)
        .send({
          success: false,
          error: "Failed to connect to Postgres database",
        });
    }
  } else if (source === "mongo") {
    return reply
      .status(501)
      .send({
        success: false,
        error: "MongoDB support is not implemented yet",
      });
  } else {
    return reply
      .status(400)
      .send({ success: false, error: "Unsupported database source" });
  }
};

export const saveDbCredentialsHandler: RouteHandler<{
  Body: saveDbCredentials;
}> = async (request, reply) => {
  const { databaseId, source, mode, dbName } = request.body;

  try {
    const existingRecord = await request.server.db
      .select()
      .from(databaseConnections)
      .where(
        and(
          eq(databaseConnections.source, source),
          eq(databaseConnections.dbName, dbName)
        )
      );

    if (existingRecord && existingRecord.length > 0)
      throw new Error("Database with the same name already exists");
    const cachedData = await redisService.getCachedDbCredentials(
      request.server.redis,
      databaseId
    );
    if (!cachedData) {
      return reply
        .status(404)
        .send({
          success: false,
          message:
            "No configuration found for the provided database, please try again",
        });
    }
    const insertPayload = {
      source,
      mode,
      dbName,
      dbCredentials: cachedData,
    };
    await request.server.db.insert(databaseConnections).values(insertPayload);
    console.log("Inserted Payload:", insertPayload);

    await redisService.clearCachedDbCredentials(
      request.server.redis,
      databaseId
    );

    return reply
      .status(201)
      .send({ success: true, message: "Database saved successfully" });
  } catch (error) {
    request.server.log.error(error, "Error saving database configuration");
    await redisService.clearCachedDbCredentials(
      request.server.redis,
      databaseId
    );
    if (error instanceof Error) {
      return reply
        .status(500)
        .send({
          success: false,
          error: error.message ?? "Failed to save database configuration",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Failed to save database configuration" });
  }
};

export const connectDbHandler: RouteHandler<{ Body: connectDb }> = async (
  request,
  reply
) => {
  const { databaseId } = request.body;

  try {
    const record = await request.server.db
      .select()
      .from(databaseConnections)
      .where(eq(databaseConnections.id, databaseId));

    if (!record || record.length === 0) {
      throw new Error("Database configuration not found");
    }
    console.log("Database Record:", record[0]);
    const encryptedCredentials = record[0]?.dbCredentials;
    if (!encryptedCredentials)
      throw new Error("Database credentials are missing");

    const decryptedCredentials = cryptoUtil.decryptObject(
      encryptedCredentials
    ) as any;
    if (!decryptedCredentials)
      throw new Error("Failed to decrypt database credentials");

    if( record[0]?.source !== "postgres") throw new Error("Only Postgres databases are supported currently");

    const buildConnectionConfigParameter = {
      source: record[0]?.source,
      mode: record[0]?.mode,
      dbCredentials: decryptedCredentials?.dbCredentials,
    };

    const connectionConfig = buildConnectionConfig(
      buildConnectionConfigParameter
    );

    const pgPool = postgresService.createPgPool(databaseId, connectionConfig);

    const res = await pgPool.query("SELECT NOW()");
    request.server.log.info(res.rows, "Database response");

    if (!res) throw new Error("Failed to establish database connection");

    const extractedSchema = await postgresService.introspectSchema(
      "postgres",
      pgPool
    );

    if (!extractedSchema)
      throw new Error("Failed to introspect database schema");

    const normalizeSchema = normalizePgSchema(extractedSchema);
    redisService.cacheSchema(request.server.redis, databaseId, normalizeSchema);

    return reply
      .status(200)
      .send({
        success: true,
        message: "Connected to database successfully",
        data:{
            databaseId,
            dbName: record[0]?.dbName,
            source: record[0]?.source,
        }
      });
  } catch (error) {
    request.server.log.error(error, "Error connecting to database");
    await postgresService.closePgPool(databaseId);
    await redisService.clearCachedSchema(request.server.redis, databaseId);
    if (error instanceof Error) {
      return reply
        .status(500)
        .send({
          success: false,
          error: error.message ?? "Error connecting to database",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error connecting to database" });
  }
};

export const listDbHandler: RouteHandler<any> = async (request, reply) => {
  try {
    const records = await request.server.db.select().from(databaseConnections);

    if (!records) throw new Error("No databases found");

    const databases = records.map((record) => {
      return {
        id: record.id,
        source: record.source,
        mode: record.mode,
        dbName: record.dbName,
      };
    });
    console.log("Databases:", databases);
    return reply.status(200).send({ success: true, data: databases });
  } catch (error) {
    request.server.log.error(error, "Error listing databases");
    if (error instanceof Error) {
      return reply
        .status(500)
        .send({
          success: false,
          error: error.message ?? "Error listing databases",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error listing databases" });
  }
};

export const deleteDbHandler: RouteHandler<{ Body: { databaseIds: string[] };}> = async (request, reply) => {
  const { databaseIds } = request.body;

  if (!Array.isArray(databaseIds) || databaseIds.length === 0)
    throw new Error("No database IDs provided for deletion");

  try {
    const result = await request.server.db
      .delete(databaseConnections)
      .where(inArray(databaseConnections.id, databaseIds));

    const deletedCount = result.rowCount || 0;

    for (const dbId of databaseIds) {
      await redisService.clearCachedSchema(request.server.redis, dbId);
      await postgresService.closePgPool(dbId);
    }

    return reply
      .status(200)
      .send({
        success: true,
        message: `Deleted ${deletedCount} databases successfully`,
      });
  } catch (error) {
    request.server.log.error(error, "Error deleting databases");
    if (error instanceof Error) {
      return reply
        .status(500)
        .send({
          success: false,
          error: error.message ?? "Error deleting databases",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error deleting databases" });
  }
};

export const getActiveDatabaseHandler: RouteHandler<any> = async (request, reply) => {
  try {
    const activeDbId = await postgresService.getActivePgPoolDatabaseId();
    if (!activeDbId) {
      return reply
        .status(404)
        .send({ success: false, error: "No active database connection" });
    }

    const record = await request.server.db
      .select()
      .from(databaseConnections)
      .where(eq(databaseConnections.id, activeDbId));

    if (!record || record.length === 0) throw new Error("Active database configuration not found");

    return reply
      .status(200)
      .send({
        success: true,
        data: {
          databaseId: record[0]?.id,
            dbName: record[0]?.dbName,
            source: record[0]?.source,
        },
      });
  } catch (error) {
    request.server.log.error(error, "Error fetching active database");
    if (error instanceof Error) {
      return reply
        .status(404)
        .send({
          success: false,
          error: error.message ?? "Error fetching active database",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error fetching active database" });
  }
};

export const disconnectDatabaseHandler: RouteHandler<{Body: connectDb}> = async (request, reply) => {
  const { databaseId } = request.body;

  try {
    const activeDbId = await postgresService.getActivePgPoolDatabaseId();
    if (activeDbId !== databaseId) throw new Error("The database is not currently connected to server");

    await postgresService.closePgPool(databaseId);
    await redisService.clearCachedSchema(request.server.redis, databaseId);

    return reply
      .status(200)
      .send({ success: true, message: "Database disconnected successfully" });

  } catch (error) {
    request.server.log.error(error, "Error disconnecting from database");
    if (error instanceof Error) {
      return reply
        .status(500)
        .send({
          success: false,
          error: error.message ?? "Error disconnecting from database",
        });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error disconnecting from database" });
  }
}
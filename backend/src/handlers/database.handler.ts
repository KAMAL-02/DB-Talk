import type { RouteHandler } from "fastify";
import type {
  connectDb,
  DatabaseCredentialsBody,
  saveDbCredentials,
} from "../types.js";
import { databaseConnections } from "../db/schema/schema.js";
import { eq } from "drizzle-orm";
import * as databaseManager from "../manager/database.manager.js";
import { getActivePool } from "../manager/pool.manager.js";

export const testConnectionHandler: RouteHandler<{
  Body: DatabaseCredentialsBody;
}> = async (request, reply) => {
  try {
    const result = await databaseManager.testConnection({
      credentials: request.body,
      redis: request.server.redis,
    });

    return reply.status(200).send({
      success: true,
      message: "Configuration validated",
      data: {
        databaseId: result.databaseId,
      },
    });
  } catch (error) {
    request.server.log.error(error, "Connection test failed");

    return reply.status(500).send({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
    });
  }
};

export const saveDbCredentialsHandler: RouteHandler<{
  Body: saveDbCredentials;
}> = async (request, reply) => {
  try {
    await databaseManager.saveDatabaseCredentials({
      database: request.body,
      db: request.server.db,
      redis: request.server.redis,
    });

    return reply.status(201).send({
      success: true,
      message: "Database saved successfully",
    });
  } catch (error) {
    request.server.log.error(error);

    return reply.status(500).send({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save database configuration",
    });
  }
};

export const connectDbHandler: RouteHandler<{ Body: connectDb }> = async (
  request,
  reply,
) => {
  try {
    const { databaseId } = request.body;

    const result = await databaseManager.connectDatabase({
      databaseId,
      db: request.server.db,
      redis: request.server.redis,
    });

    return reply.status(200).send({
      success: true,
      message: "Connected to database successfully",
      data: result,
    });
  } catch (error) {
    request.server.log.error(error);

    return reply.status(500).send({
      success: false,
      error:
        error instanceof Error ? error.message : "Error connecting to database",
    });
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
      return reply.status(500).send({
        success: false,
        error: error.message ?? "Error listing databases",
      });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error listing databases" });
  }
};

export const deleteDbHandler: RouteHandler<{
  Body: { databaseIds: string[] };
}> = async (request, reply) => {
  try {
    const { databaseIds } = request.body;

    if (!Array.isArray(databaseIds) || databaseIds.length === 0) {
      return reply.status(400).send({
        success: false,
        error: "No database IDs provided for deletion",
      });
    }

    const deletedCount = await databaseManager.deleteDatabases({
      databaseIds,
      db: request.server.db,
      redis: request.server.redis,
    });

    return reply.status(200).send({
      success: true,
      message: `Deleted ${deletedCount} databases successfully`,
    });
  } catch (error) {
    request.server.log.error(error);

    return reply.status(500).send({
      success: false,
      error:
        error instanceof Error ? error.message : "Error deleting databases",
    });
  }
};

export const getActiveDatabaseHandler: RouteHandler<any> = async (
  request,
  reply,
) => {
  try {
    const activeDbId = getActivePool();
    if (!activeDbId) {
      return reply
        .status(404)
        .send({ success: false, error: "No active database connection" });
    }

    const record = await request.server.db
      .select()
      .from(databaseConnections)
      .where(eq(databaseConnections.id, activeDbId));

    if (!record || record.length === 0)
      throw new Error("Active database configuration not found");

    return reply.status(200).send({
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
      return reply.status(404).send({
        success: false,
        error: error.message ?? "Error fetching active database",
      });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error fetching active database" });
  }
};

export const disconnectDatabaseHandler: RouteHandler<{
  Body: connectDb;
}> = async (request, reply) => {
  const { databaseId } = request.body;

  try {
    await databaseManager.disconnectDatabase({
      databaseId,
      db: request.server.db,
      redis: request.server.redis,
    });

    return reply
      .status(200)
      .send({ success: true, message: "Database disconnected successfully" });
  } catch (error) {
    request.server.log.error(error, "Error disconnecting from database");
    if (error instanceof Error) {
      return reply.status(500).send({
        success: false,
        error: error.message ?? "Error disconnecting from database",
      });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Error disconnecting from database" });
  }
};

import type { RouteHandler } from "fastify";
import { pruneSchema } from "../services/database/postgres.service.js";
import type { ChatBody, NormalizedSchema } from "../types.js";
import * as redisService from "../services/redis.service.js";
import * as postgresService from "../services/database/postgres.service.js";
import * as geminiService from "../services/gemini/gemini.service.js";

export const askHandler: RouteHandler<{ Body: ChatBody }> = async (request, reply) => {
  const { databaseId, message } = request.body;
  let generatedSQL;
  try {
    const pgPool = postgresService.getPgPool(databaseId);
    if (!pgPool) throw new Error("No database connection found. Please reconnect to the database.");

    try {
      await pgPool.query("SELECT 1");
    } catch (error) {
      request.server.log.error(error, "Database connection test failed");
      return reply.status(500).send({
        success: false,
        error: "Database connection is no longer active. Please reconnect.",
      });
    }

    // Get cached schema from Redis
    const cachedSchema = await redisService.getCachedSchema(request.server.redis, databaseId);
    if (!cachedSchema) throw new Error("Error retreiving database, please reconnect the database.");

    const schema = cachedSchema as NormalizedSchema;
    const prunedSchema = await pruneSchema(schema, message);
    const response = await geminiService.generateSQLFromQuery(
      request.server.gemini,
      message,
      prunedSchema
    );
    if (!response || !response.sql) throw new Error("Failed to generate query from the provided message.");
    generatedSQL = response.sql;

    console.log("Generated SQL:", generatedSQL);
    const { isValid, error } = postgresService.validateSQL(generatedSQL);

    if(error || !isValid) {
      return reply.status(400).send({
        success: false,
        error: error,
      });
    }
    const executionResult = await postgresService.executeSQLQuery(pgPool, generatedSQL);

    const constructResponse = {
      sql: generatedSQL,
      explanation: response.explanation,
      executionResult,
    }
    return reply.status(200).send({
      success: true,
      data: constructResponse,
    });
  } catch (error: any) {
    request.server.log.error(error, "Unexpected error in askHandler");
    if(error instanceof Error ){
      return reply.status(500).send({
        success: false,
        error: error.message ?? "An unexpected error occurred while processing your request",
        sql: generatedSQL
      });
    }
    return reply.status(500).send({
      success: false,
      error: "An unexpected error occurred while processing your request",
      sql: generatedSQL
    });
  }
};
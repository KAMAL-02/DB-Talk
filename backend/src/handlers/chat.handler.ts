import type { RouteHandler } from "fastify";
import { pruneSchema } from "../services/database/postgres.service.js";
import type { ChatBody, NormalizedSchema } from "../types.js";
import * as redisService from "../services/redis.service.js";
import * as postgresService from "../services/database/postgres.service.js";
import * as geminiService from "../services/gemini/gemini.service.js";

export const askHandler: RouteHandler<{ Body: ChatBody }> = async (request, reply) => {
  const { databaseId, message } = request.body;

  try {

    const pgPool = postgresService.getPgPool(databaseId);
    if (!pgPool) {
      return reply.status(404).send({
        success: false,
        error: "Database connection not found. Please connect to the database first.",
      });
    }

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
    if (!cachedSchema) {
      return reply.status(404).send({
        success: false,
        error: "Database schema not found. Please reconnect to the database.",
      });
    }

    const schema = cachedSchema as NormalizedSchema;

    const prunedSchema = await pruneSchema(schema, message);

    /**
     * TODO: Ask LLM with pruned schema context, validate sql provided by LLM, 
     * TODO: write service to execute SQL, return response to user
     */
    const response = await geminiService.generateSQLFromQuery(
      request.server.gemini,
      message,
      prunedSchema
    );

    const generatedSQL = response.sql;
    if (!generatedSQL) {
      return reply.status(500).send({
        success: false,
        error: "Failed to generate query from the provided message.",
      });
    }

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
    return reply.status(500).send({
      success: false,
      error: "An unexpected error occurred while processing your request",
    });
  }
};
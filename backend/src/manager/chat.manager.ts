import type { Redis } from "ioredis";
import type { GenerativeModel } from "@google/generative-ai";
import * as redisService from "../services/redis/redis.service.js";
import type {
  NormalizedSchema,
  ExecutionResult,
  AskResponse,
} from "../types.js";
import { pruneSchema } from "../services/schema/schema.service.js";
import * as geminiService from "../services/gemini/gemini.service.js";
import * as databaseManager from "./database.manager.js";

const ask = async (
  databaseId: string,
  message: string,
  redis: Redis,
  gemini: GenerativeModel,
  db: any,
): Promise<AskResponse> => {

  try {
    // Get cached schema from Redis
    const cachedSchema = await redisService.getCachedSchema(redis, databaseId);
    if (!cachedSchema) {
      throw new Error(
        "Error retrieving database schema, please reconnect the database.",
      );
    }
    console.log("Cached schema retrieved:", cachedSchema);

    // Prune the schema to reduce context size
    const schema = cachedSchema as NormalizedSchema;
    const prunedSchema = await pruneSchema(schema, message);
    console.log("Pruned schema:", prunedSchema);
    if (!prunedSchema) {
      throw new Error("Error pruning database schema.");
    }

    // Generate query
    const response = await geminiService.generateQuery(
      gemini,
      message,
      prunedSchema,
    );
    console.log("Gemini response:", response);
    if (!response || !response.query) {
      throw new Error("Failed to generate query from the provided message.");
    }

    // Execute query through database adapter
    const executionResult = await databaseManager.executeQuery(
      databaseId,
      response,
      db,
    );

    console.log("Execution Result:", executionResult);
    return {
      query: response.query,
      explanation: response.explanation,
      executionResult,
      type: response.type,
    };
  } catch (error: any) {
    console.error("Error in chat.manager.ask:", error);
    throw error;
  }
};

export { ask };

import type { RouteHandler } from "fastify";
import type { ChatBody } from "../types.js";
import * as chatManager from "../manager/chat.manager.js";

/** Only handler that processes chat queries and returns SQL, explanation, and execution results */
export const askHandler: RouteHandler<{ Body: ChatBody }> = async (
  request,
  reply,
) => {
  const { databaseId, message } = request.body;
  let generatedQuery: string | undefined;

  try {
    // let chatmanager handle the ask
    const result = await chatManager.ask(
      databaseId,
      message,
      request.server.redis,
      request.server.gemini,
      request.server.db,
    );

    generatedQuery = result.query;

    return reply.status(200).send({
      success: true,
      data: {
        query: result.query,
        explanation: result.explanation,
        executionResult: result.executionResult,
        type: result.type,
      },
    });
  } catch (error: any) {
    request.server.log.error(error, "Error in askHandler");

    return reply.status(500).send({
      success: false,
      error:
        error?.message ||
        "An unexpected error occurred while processing your request",
      sql: generatedQuery,
    });
  }
};

import type { FastifyInstance } from "fastify";
import type { ChatBody } from "../types.js";
import { chatSchema } from "../schemas/chat.schema.js";
import * as chat from "../handlers/chat.handler.js";

export const chatRoutes = async( app: FastifyInstance) => {
    app.post<{Body: ChatBody}>("/ask", { preHandler: app.authenticate, schema: chatSchema}, chat.askHandler);
}
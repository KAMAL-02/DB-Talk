import type { FastifySchema } from "fastify";

export const chatSchema: FastifySchema = {
    body: {
        type: "object",
        required: ["databaseId", "message"],
        properties: {
            databaseId: { type: "string" },
            message: { type: "string", minLength: 1, maxLength: 300 },
        }
    }
}
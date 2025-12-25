import { databaseCredentialsSchema } from "../schemas/database.schema.js";
import type { FastifyInstance } from "fastify";
import type { DatabaseCredentialsBody } from "../types.js";
import * as databaseHandler from "../handlers/database.handler.js";

export const databaseRoutes = async(app: FastifyInstance) => {
    app.post<{Body: DatabaseCredentialsBody}>(
    "/test-connection",
    {
      preHandler: app.authenticate,
      schema: databaseCredentialsSchema,
    },
    databaseHandler.testConnectionHandler
  );
}
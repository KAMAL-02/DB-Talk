import { databaseCredentialsSchema, saveDbCredsSchema, connectDbSchema } from "../schemas/database.schema.js";
import type { FastifyInstance } from "fastify";
import type { DatabaseCredentialsBody, saveDbCredentials, connectDb  } from "../types.js";
import * as database from "../handlers/database.handler.js";

export const databaseRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: DatabaseCredentialsBody }>( "/test-connection",{
      preHandler: app.authenticate,
      schema: databaseCredentialsSchema,
    },
    database.testConnectionHandler
  );

  app.post<{Body: saveDbCredentials}>("/save-database", {
    preHandler: app.authenticate, 
    schema: saveDbCredsSchema
  }, 
    database.saveDbCredentialsHandler
  );

  app.post<{Body: connectDb}>("/connect-database", {
    preHandler: app.authenticate,
    schema: connectDbSchema 
  }, 
    database.connectDbHandler
  );
};

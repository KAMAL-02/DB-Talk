import { databaseCredentialsSchema, saveDbCredsSchema, connectDbSchema, deleteDbSchema } from "../schemas/database.schema.js";
import type { FastifyInstance } from "fastify";
import type { DatabaseCredentialsBody, saveDbCredentials, connectDb, DeleteDb  } from "../types.js";
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

  app.get<any>("/list-database", {
    preHandler: app.authenticate,
  }, 
    database.listDbHandler
  );

  app.post<{Body: DeleteDb}>("/delete-database", {
    preHandler: app.authenticate,
    schema: deleteDbSchema
  }, 
    database.deleteDbHandler
  );

  app.get("/get-active-database", {
    preHandler: app.authenticate,
  }, 
    database.getActiveDatabaseHandler
  );

  app.post<{Body: connectDb}>("/disconnect-database", {
    preHandler: app.authenticate,
    schema: connectDbSchema  // both connect and disconnect use databaseId so here reusing that schema
  }, 
    database.disconnectDatabaseHandler
  );
};

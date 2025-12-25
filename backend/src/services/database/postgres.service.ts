import { Client } from "pg";
import type { testPostgresCredential } from "../../types.js";

export const testPostgresConnection = async (cred: testPostgresCredential) => {
  const connectionConfig: any = {};

  switch (cred.mode) {
    case "url":
      connectionConfig.connectionString = cred.connectionString;
      break;
    case "parts":
      connectionConfig.host = cred.host;
      connectionConfig.port = cred.port;
      connectionConfig.user = cred.username;
      connectionConfig.password = cred.password;
      connectionConfig.database = cred.database;
      break;
    default:
      throw new Error(`Unsupported connection mode`);
  }
  const pgClient = new Client(connectionConfig);
  try {
    await pgClient.connect();

    await pgClient.query("SELECT NOW()");
    console.log("Postgres connection successful");
  } catch (error) {
    console.log("Postgres connection error:", error);
    throw error;
  } finally {
    await pgClient.end();
  }
};

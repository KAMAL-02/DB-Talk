import type { DatabaseAdapter } from "../../../types.js";
import { MongoClient } from "mongodb";

export const mongoAdapter: DatabaseAdapter = {

  /** BUILD MONGO CONNECTION CONFIG */
  buildConnectionConfig(cred) {
    if (cred.mode === "url") {
      return {
        uri: cred.dbCredentials.connectionString,
        options: {
          tls: cred.dbCredentials.connectionString.includes("tls=true"),
        },
      };
    }

    if (cred.mode === "parameters") {
      const {
        host,
        port,
        username,
        password,
        database,
        tls
      } = cred.dbCredentials;

      const auth =
        username && password
          ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
          : "";

      const uri = `mongodb://${auth}${host}:${port}/${database}`;

      return {
        uri,
        options: tls ? { tls: true } : {},
      };
    }

    throw new Error("Unsupported MongoDB connection mode");
  },

  /** TEST MONGO DATABASE CONNECTION */
  async testConnection(cred: any): Promise<void> {
    let connectionConfig = this.buildConnectionConfig?.(cred);

    console.log("MongoDB connection config:", connectionConfig);
    const mongoClient = new MongoClient(connectionConfig.uri, connectionConfig.options);

    try {
      await mongoClient.connect();
      const res = await mongoClient.db().command({ping: 1});

      console.log("MongoDB connection successful", res);
    } catch (error) {
      console.log("MongoDB connection error:", error);
      throw new Error("Error connecting to MongoDB database. Please check your credentials.");
    } finally {
      await mongoClient.close();
    }
  },

  async verifyConnection(pool: any): Promise<any> {},

  async connect(databaseId: string, connectionConfig: any): Promise<any> {},

  async disconnect(databaseId: string): Promise<void> {},

  async introspectSchema(databaseId: string): Promise<any> {
    return {};
  }
};

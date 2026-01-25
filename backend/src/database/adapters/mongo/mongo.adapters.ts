import type {
  DatabaseAdapter,
  ExecutionResult,
  NormalizedSchema,
} from "../../../types.js";
import { MongoClient } from "mongodb";
import {
  clearAllPools,
  getPool,
  removePool,
  setPool,
} from "../../../manager/pool.manager.js";
import { normalizeMongoSchema } from "./mongo.normalize.js";
import { validateMongoPipeline } from "../../../services/database/mongo.service.js";

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
      const { host, port, username, password, database, tls } =
        cred.dbCredentials;

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
    const mongoClient = new MongoClient(
      connectionConfig.uri,
      connectionConfig.options,
    );

    try {
      await mongoClient.connect();
      const res = await mongoClient.db().command({ ping: 1 });

      console.log("MongoDB connection successful", res);
    } catch (error) {
      console.log("MongoDB connection error:", error);
      throw new Error(
        "Error connecting to MongoDB database. Please check your credentials.",
      );
    } finally {
      await mongoClient.close();
    }
  },

  async verifyConnection(pool: any): Promise<any> {},

  /** Connect to Mongo Database */
  async connect(
    databaseId: string,
    connectionConfigParameter: any,
  ): Promise<MongoClient> {
    if (!databaseId) {
      throw new Error("Database ID is required to connect");
    }

    const existingPool = getPool(databaseId);
    if (existingPool) {
      throw new Error("The connection of this database already exists");
    }

    if (!connectionConfigParameter) {
      throw new Error("Connection config is required to create a new pool");
    }

    const connectionConfig = this.buildConnectionConfig(
      connectionConfigParameter,
    );

    const client = new MongoClient(connectionConfig.uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
    });

    try {
      await client.connect();
      await this.verifyConnection(client);

      await clearAllPools();
      setPool(databaseId, client);

      return client;
    } catch (error: any) {
      try {
        await client.close();
      } catch (_) {}
      throw new Error(
        `Mongo connection failed: ${error?.message || "unknown error"}`,
      );
    }
  },

  /** Disconnect from Mongo Database */
  async disconnect(databaseId: string): Promise<void> {
    removePool(databaseId);
  },

  /** Introspect MongoDB schema */
  async introspectSchema(databaseId: string): Promise<NormalizedSchema> {
    const client = getPool<MongoClient>(databaseId);

    if (!client) {
      throw new Error("No active Mongo connection found for this database");
    }

    const db = client.db();

    /** Fetch collection names */
    const collectionsInfo = await db.listCollections().toArray();
    const collections = collectionsInfo.map((c) => c.name);

    /** Get sample documents to infer the schema of the collection */
    const samples: Record<string, any[]> = {};

    for (const collection of collections) {
      const col = db.collection(collection);

      samples[collection] = await col.find({}).limit(50).toArray();
    }

    const schema = normalizeMongoSchema({ collections, samples });
    console.log("schema is:", JSON.stringify(schema, null, 2));
    return schema;
  },

  async executeQuery(
    payload: {
      collection: string;
      query: any[];
    },
    client: MongoClient,
  ): Promise<ExecutionResult> {
    console.log("Executing MongoDB query with payload:", payload);
    const startTime = Date.now();
    try {
      if (!payload?.collection) {
        throw new Error("Collection name is required");
      }

      if (!Array.isArray(payload.query)) {
        throw new Error("Mongo query must be an aggregation pipeline array");
      }
      const db = client.db();
      const collection = db.collection(payload.collection);

      /** Safety Validation */
      const validationResult = validateMongoPipeline(payload.query);
      if(!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || "Invalid MongoDB query",
        };
      }
      const cursor = collection.aggregate(payload.query, {
        allowDiskUse: true,
      });

      const data = await cursor.toArray();

      const executionTime = Date.now() - startTime;
      return {
        success: true,
        data,
        count: data.length,
        executionTime,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      console.error("Mongo execution error:", error?.message);

      return {
        success: false,
        error: error?.message || "Error executing Mongo query",
        executionTime,
      };
    }
  },
};

import type {
  DatabaseAdapter,
  testPostgresCredential,
  PoolInstance,
  ExecutionResult,
  NormalizedSchema,
} from "../../../types.js";
import { Client, Pool, type QueryResult } from "pg";
import {
  setPool,
  getPool,
  removePool,
  clearAllPools,
} from "../../../manager/pool.manager.js";
import { pgIntrospectionQueries } from "./postgres.introspection.js";
import { normalizeSchema } from "./postgres.normalize.js";
import { validateSQL } from "../../../services/database/sql.service.js";

export const postgresAdapter: DatabaseAdapter = {
  /** BUILD POSTGRES CONNECTION CONFIG */
  buildConnectionConfig(cred: testPostgresCredential): any {
    if (cred.mode === "url") {
      return {
        connectionString: cred.dbCredentials.connectionString,
        ssl: cred.dbCredentials.connectionString.includes("sslmode=require")
          ? { rejectUnauthorized: false }
          : false,
      };
    } else if (cred.mode === "parameters") {
      return {
        host: cred.dbCredentials.host,
        port: cred.dbCredentials.port,
        user: cred.dbCredentials.username,
        password: cred.dbCredentials.password,
        database: cred.dbCredentials.database,
        ssl: cred.dbCredentials.ssl ? { rejectUnauthorized: false } : false,
      };
    } else {
      throw new Error("Unsupported connection mode for Postgres");
    }
  },

  /** TEST POSTGRES DATABASE CONNECTION */
  async testConnection(cred: testPostgresCredential): Promise<void> {
    let connectionConfig = this.buildConnectionConfig?.(cred);
    const pgClient = new Client(connectionConfig);
    try {
      await pgClient.connect();
      const response = await pgClient.query("SELECT NOW()");
      console.log("Postgres connection successful", response.rows);
    } catch (error) {
      console.log("Postgres connection error:", error);
      throw new Error(
        "Error connecting to Postgres database. Please check your credentials.",
      );
    } finally {
      await pgClient.end();
    }
  },

  /** VERIFY POSTGRES DATABASE CONNECTION */
  async verifyConnection(pool: PoolInstance): Promise<any> {
    try {
      const pgClient = await (pool as Pool).connect();
      await pgClient.query("SELECT NOW()");
      pgClient.release();
    } catch (error) {
      throw new Error("Error verifying Postgres database connection.");
    }
  },

  /** CONNECT TO POSTGRES DATABASE */
  async connect(
    databaseId: string,
    connectionConfigParameters: any,
  ): Promise<Pool> {
    if (!databaseId) {
      throw new Error("Database ID is required to create or get a pool");
    }

    const existingPool = getPool(databaseId);
    if (existingPool) {
      throw new Error("The connection of this database already exists");
    }
    if (!connectionConfigParameters) {
      throw new Error("Connection config is required to create a new pool");
    }
    const connectionConfig = this.buildConnectionConfig(
      connectionConfigParameters,
    );
    console.log("connectionConfig:", connectionConfig);
    const newPool = new Pool({
      ...connectionConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    await this.verifyConnection(newPool);
    await clearAllPools();
    setPool(databaseId, newPool);
    return newPool;
  },

  /** DISCONNECT FROM POSTGRES DATABASE */
  async disconnect(databaseId: string): Promise<void> {
    removePool(databaseId);
  },

  /** INTROSPECT POSTGRES SCHEMA */
  async introspectSchema(databaseId: string): Promise<NormalizedSchema> {
    const pool = getPool<Pool>(databaseId);
    if (!pool) {
      throw new Error("No active connection pool found for this database");
    }

    const [tableRes, coloumnRes, pkRes, fkRes] = await Promise.all([
      pool.query(pgIntrospectionQueries.selectTablesQuery),
      pool.query(pgIntrospectionQueries.selectColumnsQuery),
      pool.query(pgIntrospectionQueries.selectPrimaryKeyQuery),
      pool.query(pgIntrospectionQueries.selectForeignKeyQuery),
    ]);

    const normalizedSchema = normalizeSchema({
      tables: tableRes.rows,
      columns: coloumnRes.rows,
      primaryKeys: pkRes.rows,
      foreignKeys: fkRes.rows,
    });

    return normalizedSchema;
  },

  /** EXECUTE POSTGRES QUERY */
  async executeQuery(response: any, pool: any): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      const cleanSQL = response.query.trim().replace(/;$/, "");
      const validatedQuery = validateSQL(cleanSQL);

      if (!validatedQuery.isValid) {
        return {
          success: false,
          error: validatedQuery.error || "Invalid query",
        };
      }

      const result: QueryResult = await pool.query({
        text: cleanSQL,
        rowMode: "array",
      });

      if (!result)
        throw new Error("Error executing SQL query, please try again");
      const executionTime = Date.now() - startTime;

      const data = result.rows.map((row) => {
        const obj: any = {};
        result.fields.forEach((field, index) => {
          obj[field.name] = row[index];
        });
        return obj;
      });

      return {
        success: true,
        data,
        count: result.rowCount || 0,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.log("SQL execution error:", error);

      return {
        success: false,
        error: "Error executing SQL",
        executionTime,
      };
    }
  },
};

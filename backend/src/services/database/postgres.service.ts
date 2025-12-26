import { Client, Pool } from "pg";
import type { testPostgresCredential } from "../../types.js";
import { buildConnectionConfig } from "../../utils/cred.util.js";

const pools = new Map<string, Pool>();

export const testPostgresConnection = async (cred: testPostgresCredential) => {
  let connectionConfig: any = {};

  connectionConfig = buildConnectionConfig(cred);
  const pgClient = new Client(connectionConfig);
  try {
    await pgClient.connect();
    const response = await pgClient.query("SELECT NOW()");
    console.log("Postgres connection successful", response.rows);
  } catch (error) {
    console.log("Postgres connection error:", error);
    throw error;
  } finally {
    await pgClient.end();
  }
};

export const getOrCreatePgPool = (
  databaseId: string,
  connectionConfig: any
) => {
  if (!databaseId) {
    throw new Error("Database ID is required to create or get a pool");
  }

  if (pools.has(databaseId)) {
    return pools.get(databaseId)!;
  }

  const newPool = new Pool({
    ...connectionConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pools.set(databaseId, newPool);
  return newPool;
};

export const closePgPool = async (databaseId: string) => {
  const pool = pools.get(databaseId);
  if (pool) {
    await pool.end();
    pools.delete(databaseId);
  }
};

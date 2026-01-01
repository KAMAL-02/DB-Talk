import { Client, Pool } from "pg";
import type { QueryResult } from "pg";
import type { testPostgresCredential, NormalizedSchema, SQLExecutionResult } from "../../types.js";
import { buildConnectionConfig } from "../../utils/cred.util.js";
import { pgIntrospectionQueries } from "../../utils/introspection.util.js";
import { dangerousKeywords, STOP_WORDS, semanticHints } from "../../utils/constant.util.js";

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

export const createPgPool = ( databaseId: string, connectionConfig: any ) => {
  if (!databaseId) {
    throw new Error("Database ID is required to create or get a pool");
  }

  if (pools.has(databaseId)) {
    throw new Error("The connection pool of this database already exists");
  }

  if (!connectionConfig) {
    throw new Error("Connection config is required to create a new pool");
  }

  const newPool = new Pool({
    ...connectionConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pools.set(databaseId, newPool);

  /** only one pool can exist at a time */
  pools.forEach((pool, dbId) => {
    if (dbId !== databaseId) {
      pool.end();
      pools.delete(dbId);
    }
  });
  return newPool;
};

export const getPgPool = (databaseId: string): Pool | undefined => {
  return pools.get(databaseId);
};

export const closePgPool = async (databaseId: string) => {
  const pool = pools.get(databaseId);
  if (pool) {
    await pool.end();
    pools.delete(databaseId);
  }else{
    throw new Error("No active pool found for the given database");
  }
};

export const getActivePgPoolDatabaseId = async () => {
  if (pools.size === 0) {
    throw new Error("No active database connection pool found");
  }
  /** There will be only 1 pool at any moment of time */
  const [databaseId] = pools.keys();
  return databaseId;
}

export const introspectSchema = async (source: string, pool: Pool) => {
  switch (source) {
    case "postgres":
      const [tableRes, coloumnRes, pkRes, fkRes] = await Promise.all([
        pool.query(pgIntrospectionQueries.selectTablesQuery),
        pool.query(pgIntrospectionQueries.selectColumnsQuery),
        pool.query(pgIntrospectionQueries.selectPrimaryKeyQuery),
        pool.query(pgIntrospectionQueries.selectForeignKeyQuery),
      ]);

      return {
        tables: tableRes.rows,
        columns: coloumnRes.rows,
        primaryKeys: pkRes.rows,
        foreignKeys: fkRes.rows,
      };

    default:
      throw new Error(`Introspection not supported for source: ${source}`);
  }
};

export const validateSQL = ( sql: string ): { isValid: boolean; error?: string } => {
  const sqlUpper = sql.toUpperCase().trim();

  for (const keyword of dangerousKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(sqlUpper)) {
      return {
        isValid: false,
        error: `Query contains forbidden operation: ${keyword}`,
      };
    }
  }

  if (!sqlUpper.startsWith("SELECT") && !sqlUpper.startsWith("WITH")) {
    return {
      isValid: false,
      error: "Only SELECT queries are allowed",
    };
  }

  const semicolonCount = (sql.match(/;/g) || []).length;
  if (
    semicolonCount > 1 ||
    (semicolonCount === 1 && !sql.trim().endsWith(";"))
  ) {
    return {
      isValid: false,
      error: "Multiple statements or suspicious semicolons detected",
    };
  }

  return { isValid: true };
};

export const pruneSchema = async ( cachedSchema: NormalizedSchema, message: string): Promise<NormalizedSchema> => {
  const schema = cachedSchema;
  const tableNames = Object.keys(schema.tables);

  // if table length is less than or equal to 5, no need of pruning
  if (tableNames.length <= 5) {
    return schema;
  }

  const messageLower = message.toLowerCase();

  // Remove stop words & noise
  const words = messageLower
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const tableScores = new Map<string, number>();

  for (const tableName of tableNames) {
    const table = schema.tables[tableName];
    if (!table) continue;

    let score = 0;
    const tableNameLower = tableName.toLowerCase();
    const columnNames = table.columns.map((c) => c.name.toLowerCase());

    // Table name match
    if (messageLower.includes(tableNameLower)) score += 80;

    // singular / plural
    const singular = tableNameLower.endsWith("s")
      ? tableNameLower.slice(0, -1)
      : tableNameLower;
    const plural = singular.endsWith("s") ? singular : `${singular}s`;

    if (messageLower.includes(singular) || messageLower.includes(plural)) {
      score += 60;
    }

    // General important columns
    if (
      messageLower.includes("email") &&
      columnNames.some((c) => c.includes("email"))
    ) {
      score += 70;
    }

    if (
      messageLower.includes("name") &&
      columnNames.some((c) => c.includes("name"))
    ) {
      score += 40;
    }

    if (messageLower.includes("id") && columnNames.some((c) => c === "id")) {
      score += 10;
    }

    // Word-level matching
    for (const word of words) {
      if (tableNameLower.includes(word)) score += 30;

      for (const col of columnNames) {
        if (col.includes(word)) score += 15;
      }
    }

    for (const [key, hints] of Object.entries(semanticHints)) {
      if (tableNameLower.includes(key)) {
        for (const hint of hints) {
          if (messageLower.includes(hint)) score += 25;
        }
      }
    }

    if (score > 0) {
      tableScores.set(tableName, score);
    }
  }

  // Dont return full schema due to LLM context limits
  if (tableScores.size === 0) {
    return {
      source: schema.source,
      tables: {},
    };
  }

  // Ranking tables
  const MIN_SCORE = 50;

  const primaryTables = Array.from(tableScores.entries())
    .filter(([, score]) => score >= MIN_SCORE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  if (primaryTables.length === 0) {
    return {
      source: schema.source,
      tables: {},
    };
  }

  // Controlled FK expansion
  const selectedTables = new Set<string>(primaryTables);

  for (const tableName of primaryTables) {
    const table = schema.tables[tableName];
    if (!table) continue;

    const tableScore = tableScores.get(tableName) ?? 0;
    if (tableScore < 90) continue;

    for (const col of table.columns) {
      if (col.foreignKey?.referencesTable) {
        selectedTables.add(col.foreignKey.referencesTable);
      }
    }
  }

  // Build pruned schema
  const prunedSchema: NormalizedSchema = {
    source: schema.source,
    tables: {},
  };

  for (const tableName of selectedTables) {
    const table = schema.tables[tableName];
    if (table) {
      prunedSchema.tables[tableName] = table;
    }
  }

  return prunedSchema;
};

export const executeSQLQuery = async (
  pool: Pool,
  sql: string
): Promise<SQLExecutionResult> => {
  const startTime = Date.now();

  try {

    const cleanSQL = sql.trim().replace(/;$/, "");

    const result: QueryResult = await pool.query({
      text: cleanSQL,
      rowMode: "array",
    });
    if (!result) throw new Error("Error executing SQL query, please try again");
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
      rowCount: result.rowCount || 0,
      executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.log("SQL execution error:", error);

    return {
      success: false,
      error: 'Error executing SQL',
      executionTime,
    };
  }
};

export interface AppConfig {
  PORT: number;
  AI_API_KEY: string;
  ENV: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  DB_COPILOT_URL: string;
  REDIS_URL: string;
  REDIS_ENCRYPTION_SECRET: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface JWTPayload {
  email: string;
  iat?: number;
  exp?: number;
}

/* ---------- POSTGRES ---------- */

type PostgresUrlCredentials = {
  source: "postgres";
  mode: "url";
  dbCredentials: {
    connectionString: string;
  };
};

type PostgresPartsCredentials = {
  source: "postgres";
  mode: "parts";
  dbCredentials: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
};

/* ---------- MONGO ---------- */

type MongoUrlCredentials = {
  source: "mongo";
  mode: "url";
  connectionString: string;
};

type MongoPartsCredentials = {
  source: "mongo";
  mode: "parts";
  host: string;
  port: number;
  username?: string;
  password?: string;
  database: string;
};

export type DatabaseCredentialsBody =
  | PostgresUrlCredentials
  | PostgresPartsCredentials
  | MongoUrlCredentials
  | MongoPartsCredentials;

export type testPostgresCredential =
  | PostgresUrlCredentials
  | PostgresPartsCredentials;

export type saveDbCredentials = {
  source: "postgres" | "mongo";
  mode: "url" | "parts";
  dbName: string;
  databaseId: string;
};

export type connectDb = {
  databaseId: string;
}

export type NormalizedSchema = {
  source: string;
  tables: {
    [tableName: string]: {
      columns: {
        name: string;
        type: string;
        nullable: boolean;
        isPrimaryKey: boolean;
        foreignKey?: {
          referencesTable: string;
          referencesColumn: string;
        };
      }[];
    };
  };
};
export interface ChatBody {
  databaseId: string;
  message: string;
}

export interface SQLExecutionResult {
  success: boolean;
  data?: any[];
  rowCount?: number;
  error?: string;
  executionTime?: number;
}

export interface DeleteDb {
  databaseIds: string[];
}
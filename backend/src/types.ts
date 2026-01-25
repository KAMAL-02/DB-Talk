export interface AppConfig {
  PORT: number;
  AI_API_KEY: string;
  ENV: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  DB_TALK_URL: string;
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

type PostgresParametersCredentials = {
  source: "postgres";
  mode: "parameters";
  dbCredentials: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
  };
};

/* ---------- MONGO ---------- */

type MongoUrlCredentials = {
  source: "mongo";
  mode: "url";
  connectionString: string;
};

type MongoParametersCredentials = {
  source: "mongo";
  mode: "parameters";
  host: string;
  port: number;
  username?: string;
  password?: string;
  database: string;
};

export type DatabaseCredentialsBody =
  | PostgresUrlCredentials
  | PostgresParametersCredentials
  | MongoUrlCredentials
  | MongoParametersCredentials;

export type testPostgresCredential =
  | PostgresUrlCredentials
  | PostgresParametersCredentials;

export type saveDbCredentials = {
  source: string;
  mode: "url" | "parameters";
  dbName: string;
  databaseId: string;
};

export type connectDb = {
  databaseId: string;
}

export type NormalizedSchema = {
  source: string;

  tables: Record<
    string,
    {
      columns: NormalizedColumn[];
      primaryKey?: string[];
      indexes?: NormalizedIndex[];
    }
  >;
};

export type NormalizedColumn = {
  name: string;
  type: string;
  nullable: boolean;
  position?: number;
  isPrimaryKey: boolean;
  foreignKeys?: NormalizedForeignKey[];
};

export type NormalizedForeignKey = {
  referencesTable: string;
  referencesColumn: string;
};

export type NormalizedIndex = {
  name: string;
  columns: string[];
  unique: boolean;
};

export interface ChatBody {
  databaseId: string;
  message: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any[];
  count?: number;
  error?: string;
  executionTime?: number;
}

export interface DeleteDb {
  databaseIds: string[];
}

export interface DatabaseAdapter {
  buildConnectionConfig(payload: any): any;
  testConnection(payload:any): Promise<void>;
  verifyConnection(pool: PoolInstance): Promise<any>;
  connect(databaseId: string, connectionConfig: any): Promise<any>;
  disconnect(databaseId: string): Promise<void>;
  introspectSchema(databaseId: string): Promise<any>;
  executeQuery(query: string, pool: PoolInstance): Promise<ExecutionResult>;
}

export type PoolInstance = unknown;

export interface AskResponse {
  query: string;
  explanation: string;
  executionResult: ExecutionResult;
}
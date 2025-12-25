export interface AppConfig {
  PORT: number;
  AI_API_KEY: string;
  ENV: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
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
  connectionString: string;
};

type PostgresPartsCredentials = {
  source: "postgres";
  mode: "parts";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
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

export type testPostgresCredential = PostgresUrlCredentials | PostgresPartsCredentials;
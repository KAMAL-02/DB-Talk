export const buildConnectionConfig = (cred: any) => {
    console.log("Building connection config for credentials:", cred);
  if (cred.source === "postgres") {
    if (cred.mode === "url") {
      return {
        connectionString: cred.dbCredentials.connectionString,
        ssl: cred.dbCredentials.connectionString.includes("sslmode=require")
          ? { rejectUnauthorized: false }
          : false,
      };
    } else if (cred.mode === "parts") {
      return {
        host: cred.dbCredentials.host,
        port: cred.dbCredentials.port,
        user: cred.dbCredentials.username,
        password: cred.dbCredentials.password,
        database: cred.dbCredentials.database,
      };
    } else {
      throw new Error("Unsupported connection mode for Postgres");
    }
  } else {
    throw new Error("Unsupported database source for connection config");
  }
};

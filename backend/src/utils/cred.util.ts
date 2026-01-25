/** DEPRECATED */

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
  } else {
    throw new Error("Unsupported database source for connection config");
  }
};

export const extractDbName = (cred: any) => {
  console.log("Extracting DB name from credentials:", cred);
  if (cred.source !== "postgres") {
    throw new Error("Unsupported database source");
  }

  if (cred.mode === "url") {
    if (!cred.dbCredentials.connectionString) {
      throw new Error("Connection string is missing");
    }

    let url: URL;
    try {
      url = new URL(cred.dbCredentials.connectionString);
      console.log("Parsed URL:", url);
    } catch {
      throw new Error("Invalid Postgres connection string");
    }

    const dbName = url.pathname.replace("/", "");
    if (!dbName) {
      throw new Error("Database name not found in connection string");
    }

    return dbName;
  }

  if (cred.mode === "parameters") {
    if (!cred.dbCredentials.database) {
      throw new Error("Database name is missing");
    }
    return cred.dbCredentials.database;
  }

  throw new Error("Unsupported connection mode");
};

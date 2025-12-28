import type { FastifySchema } from "fastify";

export const databaseCredentialsSchema: FastifySchema = {
  body: {
    type: "object",

    properties: {
      source: {
        type: "string",
        enum: ["postgres", "mongo"],
      },
      mode: {
        type: "string",
        enum: ["url", "parts"],
      },
      dbCredentials: {
        type: "object",
        properties: {
          connectionString: { type: "string" },
          host: { type: "string" },
          port: { type: "number" },
          username: { type: "string" },
          password: { type: "string" },
          database: { type: "string" },
        },
        additionalProperties: false,
      },
    },

    required: ["source", "mode", "dbCredentials"],

    allOf: [
      /* ---------- POSTGRES / URL ---------- */
      {
        if: {
          type: "object",
          properties: {
            source: { const: "postgres" },
            mode: { const: "url" },
          },
        },
        then: {
          type: "object",
          properties: {
            dbCredentials: {
              type: "object",
              required: ["connectionString"],
              properties: {
                connectionString: {
                  type: "string",
                  pattern: "^postgres(ql)?:\\/\\/",
                },
              },
            },
          },
        },
      },

      /* ---------- POSTGRES / PARTS ---------- */
      {
        if: {
          type: "object",
          properties: {
            source: { const: "postgres" },
            mode: { const: "parts" },
          },
        },
        then: {
          type: "object",
          properties: {
            dbCredentials: {
              type: "object",
              required: [
                "host",
                "port",
                "username",
                "password",
                "database",
              ],
            },
          },
        },
      },

      /* ---------- MONGO / URL ---------- */
      {
        if: {
          type: "object",
          properties: {
            source: { const: "mongo" },
            mode: { const: "url" },
          },
        },
        then: {
          type: "object",
          properties: {
            dbCredentials: {
              type: "object",
              required: ["connectionString"],
              properties: {
                connectionString: {
                  type: "string",
                  pattern: "^mongodb(\\+srv)?:\\/\\/",
                },
              },
            },
          },
        },
      },

      /* ---------- MONGO / PARTS ---------- */
      {
        if: {
          type: "object",
          properties: {
            source: { const: "mongo" },
            mode: { const: "parts" },
          },
        },
        then: {
          type: "object",
          properties: {
            dbCredentials: {
              type: "object",
              required: ["host", "port", "database"],
            },
          },
        },
      },
    ],
  },
};

export const saveDbCredsSchema : FastifySchema = {
  body: {
    type: "object",
    properties: {
      source: {
        type: "string",
        enum: ["postgres", "mongo"],
      },
      mode: {
        type: "string",
        enum: ["url", "parts"],
      },
      databaseId: { type: "string" },
      dbName: { type: "string"}
    },
    required: ["databaseId", "dbName"],
  }
}

export const connectDbSchema : FastifySchema = {
  body: {
    type: "object",
    properties: {
      databaseId: { type: "string" },
    },
    required: ["databaseId"],
  }
}

export const deleteDbSchema : FastifySchema = {
  body: {
    type: "object",
    properties: {
      databaseIds: { type: "array", items: { type: "string" } },
    },
    required: ["databaseIds"],
  }
}

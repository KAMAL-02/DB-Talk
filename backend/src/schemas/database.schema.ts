import type { FastifySchema } from "fastify";

export const databaseCredentialsSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["source", "mode"],
    properties: {
      source: {
        type: "string",
        enum: ["postgres", "mongo"],
      },
      mode: {
        type: "string",
        enum: ["url", "parts"],
      },
    },
    /**
       * * oneOf is used here to create conditional validation rules based on the
       * * combination of 'source' and 'mode' fields.
       * * Depending on these values, different sets of required fields and validation
       * * rules are applied.
    */
    oneOf: [

      /* Postgres - URL Mode */
      {
        if: {
          properties: {
            source: { const: "postgres" },
            mode: { const: "url" },
          },
        },
        then: {
          required: ["url"],
          properties: {
            connectionString: {
              type: "string",
              pattern: "^postgres(ql)?:\\/\\/",
            },
          },
        },
      },

      /* Postgres - Parts Mode */
      {
        if: {
          properties: {
            source: { const: "postgres" },
            mode: { const: "parts" },
          },
        },
        then: {
          required: ["host", "port", "username", "password", "database"],
          properties: {
            host: { type: "string" },
            port: { type: "number" },
            username: { type: "string" },
            password: { type: "string" },
            database: { type: "string" },
          },
        },
      },

      /* MongoDB - URL Mode */
      {
        if: {
          properties: {
            source: { const: "mongo" },
            mode: { const: "url" },
          },
        },
        then: {
          required: ["url"],
          properties: {
            connectionString: {
              type: "string",
              pattern: "^mongodb(\\+srv)?:\\/\\/",
            },
          },
        },
      },

      /* MongoDB - Parts Mode */
      {
        if: {
          properties: {
            source: { const: "mongo" },
            mode: { const: "parts" },
          },
        },
        then: {
          required: ["host", "port", "database"],
          properties: {
            host: { type: "string" },
            port: { type: "number" },
            username: { type: "string" },
            password: { type: "string" },
            database: { type: "string" },
          },
        },
      },
    ],
  },
};

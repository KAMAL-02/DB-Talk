/** Schema to determine the http request and http response format */

import type { FastifySchema } from "fastify";

export const databaseCredentialsSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["source", "mode", "dbCredentials"],

    properties: {
      source: { type: "string" },
      mode: { type: "string" },
      dbCredentials: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
};

export const saveDbCredsSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["databaseId", "dbName"],

    properties: {
      databaseId: { type: "string" },
      dbName: { type: "string" },
    },
  },
};

export const connectDbSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      databaseId: { type: "string" },
    },
    required: ["databaseId"],
  },
};

export const deleteDbSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      databaseIds: { type: "array", items: { type: "string" } },
    },
    required: ["databaseIds"],
  },
};

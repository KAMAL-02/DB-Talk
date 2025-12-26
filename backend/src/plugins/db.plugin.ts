import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { db } from '../db/db.js'

declare module 'fastify' {
    interface FastifyInstance {
        db: typeof db;
    }
}

export const dbPlugin = fp(async (app: FastifyInstance) => {
    app.decorate('db', db);
    console.log("Database plugin initialized.");
})
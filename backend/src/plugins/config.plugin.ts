import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../types.js";

declare module 'fastify' {
    interface FastifyInstance {
        config: AppConfig;
    }
}

export const config: AppConfig = {
    PORT: Number(process.env.PORT) || 3001,
    AI_API_KEY: process.env.AI_API_KEY || '',
    ENV: process.env.ENV || 'development',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    DB_TALK_URL: process.env.DB_TALK_URL || '',
    REDIS_URL: process.env.REDIS_URL || '',
    REDIS_ENCRYPTION_SECRET: process.env.REDIS_ENCRYPTION_SECRET || '',
}

export const configPlugin = fp(async (app: FastifyInstance) => {
    app.decorate('config', config);
    console.log("Config:", app.config);
});
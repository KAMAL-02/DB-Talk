import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { config } from "./config.plugin.js";
import { Redis } from "ioredis";

declare module 'fastify' {
    interface FastifyInstance {
        redis: Redis;
    }
}

export const redisPlugin = fp(async (app: FastifyInstance) => {
  const redis = new Redis(app.config.REDIS_URL);

  app.decorate("redis", redis);

  app.addHook("onClose", async () => {
    await redis.quit();
  });
});
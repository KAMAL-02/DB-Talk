import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

export const corsPlugin = fp(async (app: FastifyInstance) => {
    await app.register(cors, {
        origin: true,
        credentials: true,
    });
});

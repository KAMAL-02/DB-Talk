import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { databaseRoutes } from './database.route.js';

export const registerRoutes = async (app: FastifyInstance) => {

    app.get('/health', async (request, reply) => {
        return reply.status(200).send({ 
            success: true, 
            data: { status: 'ok', timeStamp: new Date().toISOString() } 
        });
    });

    await app.register(authRoutes, { prefix: '/auth' });
    await app.register(databaseRoutes, { prefix: '/database' });
};

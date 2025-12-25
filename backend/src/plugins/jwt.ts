import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export const jwtPlugin = fp(async (app: FastifyInstance) => {
    await app.register(jwt, {
        secret: app.config.JWT_SECRET,
    });

    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ 
                success: false, 
                error: 'Unauthorized' 
            });
        }
    });
});
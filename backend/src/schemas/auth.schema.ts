import type { FastifySchema } from 'fastify';

export const loginSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                    }
                }
            }
        },
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            }
        }
    }
};

export const protectedRouteSchema: FastifySchema = {
    headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
            authorization: { type: 'string' }
        }
    }
};

import fastify from 'fastify';
import { config } from './plugins/config.plugin.js';

const isDevelopment = config.ENV === 'development';
console.log(`Environment: ${config.ENV}`);
export const app = fastify({
    logger: isDevelopment ? {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                colorize: true,
            }
        }
    } : true
})
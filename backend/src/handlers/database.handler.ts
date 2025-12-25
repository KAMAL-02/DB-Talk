import type { RouteHandler } from "fastify";
import type { DatabaseCredentialsBody } from "../types.js";
import * as postgresService from "../services/database/postgres.service.js";

export const testConnectionHandler: RouteHandler<{Body: DatabaseCredentialsBody}> = async (request, reply) => {
    const { source } = request.body;

    if (source === 'postgres') {
        try {
            await postgresService.testPostgresConnection(request.body);
            return reply.status(200).send({ success: true, message: 'Configuration validated, DB is ready to connect' });
        } catch (error) {
            request.server.log.error(error, 'Postgres connection test failed');
            return reply.status(500).send({ success: false, message: 'Failed to connect to Postgres database' });
        }
    } else if (source === 'mongo') {
        return reply.status(501).send({ success: false, message: 'MongoDB support is not implemented yet' });
    } else {
        return reply.status(400).send({ success: false, message: 'Unsupported database source' });
    }
}
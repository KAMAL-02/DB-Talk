import type { RouteHandler } from "fastify";
import type { connectDb, DatabaseCredentialsBody, saveDbCredentials } from "../types.js";
import * as postgresService from "../services/database/postgres.service.js";
import * as redisService from "../services/redis.service.js";
import { randomUUID } from "crypto";
import * as cryptoUtil from "../utils/crypto.util.js";
import { databaseConnections } from "../db/schema/schema.js";
import { eq } from "drizzle-orm";
import { buildConnectionConfig } from "../utils/cred.util.js";
import { normalizePgSchema } from "../utils/introspection.util.js";

export const testConnectionHandler: RouteHandler<{Body: DatabaseCredentialsBody}> = async (request, reply) => {
    const { source, mode, ...dbCred } = request.body;
    console.log("request body:", request.body);
    if (source === 'postgres') {
        try {
            await postgresService.testPostgresConnection(request.body);

            const databaseId = randomUUID();
            const encryptedCredentials = cryptoUtil.encryptObject(dbCred)
            if(!encryptedCredentials) {
                return reply.status(500).send({ success: false, message: 'Failed to encrypt database credentials' });
            }
            redisService.cacheDbCredentials(request.server.redis, databaseId, encryptedCredentials);
            return reply.status(200).send({ success: true, message: 'Configuration validated', data: { databaseId } });
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

export const saveDbCredentialsHandler: RouteHandler<{Body: saveDbCredentials}> = async (request, reply) => {
    const { databaseId, source, mode }  = request.body;

    try {
        const cachedData = await redisService.getCachedDbCredentials(request.server.redis, databaseId);
        if (!cachedData) {
            return reply.status(404).send({ success: false, message: 'No configuration found for the provided database, please try again' });
        }
        const insertPayload = {
            source,
            mode,
            dbCredentials: cachedData
        }

        const insertedPayload = await request.server.db.insert(databaseConnections).values(insertPayload);
        console.log("Inserted Payload:", insertedPayload);

        await redisService.clearCachedDbCredentials(request.server.redis, databaseId);

        return reply.status(201).send({ success: true, message: 'Database saved successfully' });
    } catch (error) {
        request.server.log.error(error, 'Error saving database configuration');
        return reply.status(500).send({ success: false, message: 'Failed to save database configuration' });
    }
}

export const connectDbHandler: RouteHandler<{Body: connectDb}> = async(request, reply) => {
    const { databaseId } = request.body;

    try {
        const record = await request.server.db
        .select()
        .from(databaseConnections)
        .where(eq(databaseConnections.id, databaseId));

        if (!record || record.length === 0) {
            return reply.status(404).send({ success: false, message: 'Database configuration not found' });
        }
        console.log("Database Record:", record[0]);
        const encryptedCredentials = record[0]?.dbCredentials;
        if (!encryptedCredentials) {
            return reply.status(500).send({ success: false, message: 'No credentials found for the database' });
        }

        const decryptedCredentials = cryptoUtil.decryptObject(encryptedCredentials) as any;
        if (!decryptedCredentials) {
            return reply.status(500).send({ success: false, message: 'Failed to decrypt database credentials' });
        }

        const buildConnectionConfigParameter = {
            source: record[0]?.source,
            mode: record[0]?.mode,
            dbCredentials: decryptedCredentials?.dbCredentials
        }

        const connectionConfig = buildConnectionConfig(buildConnectionConfigParameter);
        console.log("Connection Config:", connectionConfig);

        const pgPool = postgresService.getOrCreatePgPool(databaseId, connectionConfig);

        const res = await pgPool.query('SELECT NOW()');
        console.log('Database connection successful:', res.rows);

        if(!res){
            return reply.status(500).send({ success: false, message: 'Failed to connect to database' });
        }

        const extractedSchema = await postgresService.introspectSchema('postgres', pgPool);

        if(!extractedSchema){
            return reply.status(500).send({ success: false, message: 'Failed to introspect database schema' });
        }

        const normalizeSchema = normalizePgSchema(extractedSchema);
        redisService.cacheSchema(request.server.redis, databaseId, normalizeSchema);

        return reply.status(200).send({ success: true, message: 'Connected to database successfully', data: databaseId });

    } catch (error) {
        request.server.log.error(error, 'Error connecting to database');
        return reply.status(500).send({ success: false, message: 'Failed to connect to database' });
    }
}
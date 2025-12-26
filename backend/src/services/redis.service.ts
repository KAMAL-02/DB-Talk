import type { AnyAaaaRecord } from "dns";
import type { Redis as RedisType } from "ioredis";

export const cacheSchema = async ( redis: RedisType, databaseId: string, schema: any ) => {
    const key = `db_schema:${databaseId}`;
    const SCHEMA_TTL = 60 * 60; // 1 hour
    try {
        await redis.set(key, JSON.stringify(schema), 'EX', SCHEMA_TTL);
    } catch (error) {
        console.error("Error caching schema:", error);
        throw "Error caching schema";
    }
}

export const getCachedSchema = async( redis: RedisType, databaseId: string ) => {
    const key = `db_schema:${databaseId}`;
    try {
        const cachedSchema = await redis.get(key);
        if (cachedSchema) {
            return JSON.parse(cachedSchema);
        }
        return null;
    } catch (error) {
        console.error("Error retrieving cached schema:", error);
        throw "Error retrieving cached schema";
    }
}

export const clearCachedSchema = async( redis: RedisType, databaseId: string ) => {
    const key = `db_schema:${databaseId}`;
    try {
        await redis.del(key);
    } catch (error) {
        console.error("Error clearing cached schema:", error);
        throw "Error clearing cached schema";
    }
}
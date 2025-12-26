import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres'
import { config } from '../plugins/config.plugin.js';
import * as schema from './schema/schema.js';

const pool = pg.Pool;

const expanded_schema = {
    ...schema,
}

const pgPool = new pool({
    connectionString: config.DB_COPILOT_URL,
})

pgPool.on('error', (err) => {
  console.error('Unexpected PG Pool Error:', err);
});

export const db = drizzle(pgPool, { schema: expanded_schema });
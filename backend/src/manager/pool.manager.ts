import type { PoolInstance } from "../types.js";

/** ONLY 1 POOL ( ANY DB ) CAN EXIST AT A TIME FOR NOW */
const pools = new Map<string, PoolInstance>();

export function getActivePool() {
  if (pools.size < 1)
    throw new Error("No active database connection pool found");

  const [databaseId] = pools.keys();
  return databaseId;
}

/** Set active pool */
export function setPool(databaseId: string, pool: PoolInstance) {
  pools.set(databaseId, pool);
}

/** Get pool based on database ID */
export function getPool<T = PoolInstance>(databaseId: string): T | undefined {
  return pools.get(databaseId) as T | undefined;
}

/** Remove pool based on database ID */
export function removePool(databaseId: string) {
  const pool = pools.get(databaseId);

  if (pool && typeof (pool as any).end === "function") {
    (pool as any).end();
  }

  pools.delete(databaseId);
}

/**  shut down all active database connections
 * Since different database clients expose different cleanup methods, (e.g. pool.end() for Postgres, client.close() for Mongo),
 * we dynamically detect and invoke the correct one.
 */
export async function clearAllPools() {
  const tasks: Promise<any>[] = [];

  for (const pool of pools.values()) {
    if (!pool) continue;

    if (typeof (pool as any).end === "function") {
      tasks.push((pool as any).end());
    } else if (typeof (pool as any).close === "function") {
      tasks.push((pool as any).close());
    }
  }

  await Promise.allSettled(tasks);
  pools.clear();
}

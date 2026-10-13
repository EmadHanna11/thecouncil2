import pg from "pg";
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for durable Council storage.");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});
pool.on("error", () => console.error("[storage] A database connection was interrupted."));
const transaction = new AsyncLocalStorage<any>();
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const client = () => transaction.getStore() || pool;

export function postgresStore(name: string) {
  const store = hash(name);
  return {
    async get(key: string, options?: { type: string }) {
      const result = await client().query(
        "SELECT value FROM council_records WHERE store = $1 AND key = $2",
        [store, hash(key)],
      );
      const text = result.rows[0]?.value;
      return text === undefined ? null : options?.type === "json" ? JSON.parse(text) : text;
    },
    async set(key: string, value: string) {
      await client().query(
        `INSERT INTO council_records (store, key, value) VALUES ($1, $2, $3)
         ON CONFLICT (store, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [store, hash(key), value],
      );
    },
    async setJSON(key: string, value: unknown) { await this.set(key, JSON.stringify(value)); },
    async setJSONIfAbsent(key: string, value: unknown) {
      const result = await client().query(
        "INSERT INTO council_records (store, key, value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [store, hash(key), JSON.stringify(value)],
      );
      return result.rowCount === 1;
    },
    async incrementJSONIfBelow(key: string, limit: number) {
      const result = await client().query(
        `INSERT INTO council_records (store, key, value) VALUES ($1, $2, '1')
         ON CONFLICT (store, key) DO UPDATE
         SET value = (council_records.value::integer + 1)::text, updated_at = now()
         WHERE council_records.value ~ '^[0-9]+$' AND council_records.value::integer < $3
         RETURNING value`,
        [store, hash(key), limit],
      );
      return result.rows[0] ? Number(result.rows[0].value) : null;
    },
    async delete(key: string) {
      await client().query("DELETE FROM council_records WHERE store = $1 AND key = $2", [store, hash(key)]);
    },
  };
}

// All reads and writes inside the callback use the SAME transaction/connection.
// Locks coordinate multiple server processes as well as overlapping requests.
export async function withPostgresLock<T>(name: string, key: string, fn: () => Promise<T>): Promise<T> {
  if (transaction.getStore()) throw new Error("Nested storage transactions are not supported.");
  const connection = await pool.connect();
  try {
    await connection.query("BEGIN");
    await connection.query("SET LOCAL lock_timeout = '15s'");
    await connection.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`${name}:${key}`]);
    const result = await transaction.run(connection, fn);
    await connection.query("COMMIT");
    return result;
  } catch (error) {
    await connection.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { connection.release(); }
}

export async function storageReady() {
  await pool.query("SELECT store FROM council_records LIMIT 0");
}
export async function closeStorage() { await pool.end(); }

// Used only by the explicit development import command. It preserves newer
// database values and does not need to recover opaque hashed account keys.
export async function importLocalRecord(store: string, key: string, value: string) {
  if (!/^[a-f0-9]{64}$/.test(store) || !/^[a-f0-9]{64}$/.test(key)) throw new Error("Invalid record path.");
  return pool.query(
    "INSERT INTO council_records (store, key, value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
    [store, key, value],
  );
}
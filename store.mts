import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Netlify deployments retain their original storage. Replit uses PostgreSQL.
// Local files are permitted ONLY by the explicit isolated-test option.
const netlifyBlobs = process.env.COUNCIL_LOCAL_RUNTIME === "1"
  ? null
  : await import("@netlify/blobs");
const postgres = !netlifyBlobs && process.env.COUNCIL_TEST_STORAGE !== "1"
  ? await import("./postgres-store.mts")
  : null;
const root = fileURLToPath(new URL("../../.test-data/", import.meta.url));
const locks = new Map<string, Promise<void>>();

export async function withStoreLock<T>(name: string, key: string, fn: () => Promise<T>): Promise<T> {
  if (postgres) return postgres.withPostgresLock(name, key, fn);
  if (netlifyBlobs) {
    // Account records are read-modify-written by auth and quota handlers. Use
    // Blob's conditional writes to keep those operations serialized across
    // concurrent function instances, without changing the account store.
    if (["council-auth", "council-friends"].includes(name) && key === "writes") return withBlobLock(name, key, fn);
    return fn();
  }
  const id = `${name}:${key}`;
  const previous = locks.get(id) || Promise.resolve();
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const queued = previous.then(() => held);
  locks.set(id, queued);
  await previous;
  try { return await fn(); }
  finally {
    release();
    if (locks.get(id) === queued) locks.delete(id);
  }
}

async function withBlobLock<T>(name: string, key: string, fn: () => Promise<T>) {
  const lockStore = netlifyBlobs!.getStore({ name: `${name}-locks`, consistency: "strong" });
  const lockKey = `lock/${createHash("sha256").update(`${name}:${key}`).digest("hex")}`;
  const owner = randomUUID();
  const timeoutAt = Date.now() + 15_000;
  const leaseMs = 45_000;
  let leaseEtag: string | undefined;
  while (!leaseEtag) {
    const current = await lockStore.getWithMetadata(lockKey, { type: "json" });
    if (!current) {
      const created = await lockStore.setJSON(lockKey, { owner, expiresAt: Date.now() + leaseMs }, { onlyIfNew: true });
      if (created.modified) {
        if (!created.etag) throw new Error("Account write lock has no ETag.");
        leaseEtag = created.etag;
      }
    } else {
      const expiresAt = current.data?.expiresAt;
      if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
        if (!current.etag) throw new Error("Account write lock has no ETag.");
        const replaced = await lockStore.setJSON(lockKey, { owner, expiresAt: Date.now() + leaseMs }, { onlyIfMatch: current.etag });
        if (replaced.modified) {
          if (!replaced.etag) throw new Error("Account write lock has no ETag.");
          leaseEtag = replaced.etag;
        }
      }
    }
    if (!leaseEtag) {
      if (Date.now() >= timeoutAt) throw new Error("Account write lock timed out.");
      await new Promise(resolve => setTimeout(resolve, 35));
    }
  }
  try { return await fn(); }
  finally {
    const current = await lockStore.getWithMetadata(lockKey, { type: "json" });
    if (current?.data?.owner === owner && current.etag === leaseEtag) {
      await lockStore.setJSON(lockKey, { owner: "", expiresAt: 0 }, { onlyIfMatch: leaseEtag });
    }
  }
}

export async function storageReady() { await postgres?.storageReady(); }
export async function closeStorage() { await postgres?.closeStorage(); }

export function getStore(options: string | { name: string; consistency?: string }) {
  if (netlifyBlobs) return netlifyBlobs.getStore(options as any);
  const name = typeof options === "string" ? options : options.name;
  if (postgres) return postgres.postgresStore(name);
  const directory = join(root, createHash("sha256").update(name).digest("hex"));
  const pathFor = (key: string) => join(directory, createHash("sha256").update(key).digest("hex"));
  return {
    async get(key: string, options?: { type: string }) {
      let text: string;
      try { text = await readFile(pathFor(key), "utf8"); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
      return options?.type === "json" ? JSON.parse(text) : text;
    },
    async set(key: string, value: string) {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const path = pathFor(key);
      const temporary = `${path}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, value, { mode: 0o600 });
        await rename(temporary, path);
      } finally { await rm(temporary, { force: true }); }
    },
    async setJSON(key: string, value: unknown) {
      await this.set(key, JSON.stringify(value));
    },
    async setJSONIfAbsent(key: string, value: unknown) {
      return withStoreLock(`local-${name}`, key, async () => {
        if (await this.get(key) !== null) return false;
        await this.setJSON(key, value);
        return true;
      });
    },
    async incrementJSONIfBelow(key: string, limit: number) {
      return withStoreLock(`local-${name}`, key, async () => {
        const current = await this.get(key, { type: "json" });
        if (current != null && (!Number.isSafeInteger(current) || current < 0 || current >= limit)) return null;
        const next = (current || 0) + 1;
        await this.setJSON(key, next);
        return next;
      });
    },
    async delete(key: string) { await rm(pathFor(key), { force: true }); },
  };
}

export async function setJSONIfAbsent(name: string, key: string, value: unknown) {
  if (netlifyBlobs) {
    return (await netlifyBlobs.getStore({ name }).setJSON(key, value, { onlyIfNew: true })).modified;
  }
  if (postgres) return postgres.postgresStore(name).setJSONIfAbsent(key, value);
  return getStore(name).setJSONIfAbsent(key, value);
}

export async function incrementJSONIfBelow(name: string, key: string, limit: number) {
  if (netlifyBlobs) {
    const store = netlifyBlobs.getStore({ name });
    for (let attempt = 0; attempt < 24; attempt++) {
      const current = await store.getWithMetadata(key, { type: "json" });
      if (!current) {
        if ((await store.setJSON(key, 1, { onlyIfNew: true })).modified) return 1;
      } else {
        const value = current.data;
        if (!Number.isSafeInteger(value) || value < 0 || value >= limit) return null;
        if (!current.etag) throw new Error("Attempt counter has no ETag.");
        if ((await store.setJSON(key, value + 1, { onlyIfMatch: current.etag })).modified) return value + 1;
      }
    }
    throw new Error("Could not atomically update the attempt counter.");
  }
  if (postgres) return postgres.postgresStore(name).incrementJSONIfBelow(key, limit);
  return getStore(name).incrementJSONIfBelow(key, limit);
}

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
delete process.env.COUNCIL_TEST_STORAGE;
const { getStore, withStoreLock, closeStorage } = await import("../netlify/lib/store.mts");
const name = `council-test-${randomUUID()}`;
const store = getStore(name);
after(closeStorage);

test("PostgreSQL preserves all 20 simultaneous counter increments", async () => {
  const key = "concurrent";
  try {
    await store.set(key, "0");
    await Promise.all(Array.from({ length: 20 }, () => withStoreLock(name, key, async () => {
      const used = Number(await store.get(key));
      await store.set(key, String(used + 1));
    })));
    assert.equal(await store.get(key), "20");
    assert.equal(await getStore(name).get(key), "20");
  } finally { await store.delete(key); }
});

test("only five simultaneous callers can reserve a five-call quota", async () => {
  const key = "quota";
  try {
    const accepted = await Promise.all(Array.from({ length: 20 }, () => withStoreLock(name, key, async () => {
      const used = Number(await store.get(key) || 0);
      if (used >= 5) return false;
      await store.set(key, String(used + 1));
      return true;
    })));
    assert.equal(accepted.filter(Boolean).length, 5);
    assert.equal(await store.get(key), "5");
  } finally { await store.delete(key); }
});

test("failed transactions roll back writes and release their lock", async () => {
  const key = "rollback";
  try {
    await store.setJSON(key, { count: 1 });
    await assert.rejects(withStoreLock(name, key, async () => {
      await store.setJSON(key, { count: 99 });
      throw new Error("intentional failure");
    }), /intentional failure/);
    assert.deepEqual(await store.get(key, { type: "json" }), { count: 1 });
    await withStoreLock(name, key, () => store.setJSON(key, { count: 2 }));
    assert.deepEqual(await store.get(key, { type: "json" }), { count: 2 });
  } finally { await store.delete(key); }
});
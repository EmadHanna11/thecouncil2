import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
process.env.MOONSHOT_API_KEY = "unit-test-only-not-a-real-key";
process.env.AI_PROVIDER = "kimi";
process.env.AI_FALLBACK_PROVIDER = "";
process.env.DAILY_CALL_LIMIT = "3";
process.env.REQUIRE_SIGNIN = "0";
delete process.env.RESEND_API_KEY;
delete process.env.SITE_PASSKEY;
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: ai } = await import("../netlify/functions/ai.mts");
const { getStore } = await import("../netlify/lib/store.mts");
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });
const request = () => new Request("https://council.test/api/ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task: "pick", q: "A safe quota test", count: 2 }),
});

test("AI handler enforces its cap across simultaneous requests", async () => {
  const ip = `test-${randomUUID()}`;
  const key = `${new Date().toISOString().slice(0, 10)}/${ip}`;
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls++;
    return new Response('data: {"choices":[{"delta":{"content":"test"}}]}\n\n');
  };
  try {
    const results = await Promise.all(Array.from({ length: 20 }, () => ai(request(), { ip })));
    assert.equal(results.filter(r => r.status === 200).length, 3);
    assert.equal(results.filter(r => r.status === 429).length, 17);
    assert.equal(upstreamCalls, 3);
    assert.equal(await getStore("council-usage").get(key), "3");
    await Promise.all(results.map(r => r.text()));
  } finally {
    await getStore("council-usage").delete(key);
    globalThis.fetch = originalFetch;
  }
});

test("a broken usage record fails closed without calling the AI provider", async () => {
  const ip = `test-${randomUUID()}`;
  const key = `${new Date().toISOString().slice(0, 10)}/${ip}`;
  const store = getStore("council-usage");
  let upstreamCalls = 0;
  globalThis.fetch = async () => { upstreamCalls++; return new Response("unexpected"); };
  try {
    // A NaN count must never be interpreted as unlimited budget.
    await store.set(key, "not-a-number");
    const response = await ai(request(), { ip });
    assert.equal(response.status, 503);
    assert.equal(upstreamCalls, 0);
  } finally { await store.delete(key); globalThis.fetch = originalFetch; }
});
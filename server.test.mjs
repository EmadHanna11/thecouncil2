import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Keep tests deterministic and prevent any paid provider/email calls.
for (const key of ["MOONSHOT_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "RESEND_API_KEY", "SITE_PASSKEY"]) delete process.env[key];
process.env.COUNCIL_TEST_STORAGE = "1";
process.env.REQUIRE_SIGNIN = "0";
const { createCouncilServer } = await import("../replit-server.mjs");
const { getStore } = await import("../netlify/lib/store.mts");
let server, base;
before(async () => {
  server = createCouncilServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });

test("serves the imported site", async () => {
  const r = await fetch(base);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/html/);
  assert.match(await r.text(), /The Council/);
});
test("AI status explicitly reports an unconfigured provider", async () => {
  assert.deepEqual(await (await fetch(`${base}/api/ai`)).json(), { live: false, provider: null, providers: [], auth: false });
  const r = await fetch(`${base}/api/ai`, { method: "POST", body: "{}" });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).code, "sampling_disabled");
});
test("accounts stay disabled when configured off, and admin needs its secret", async () => {
  assert.deepEqual(await (await fetch(`${base}/api/auth`)).json(), { enabled: false, signedIn: false });
  assert.equal((await fetch(`${base}/admin`)).status, 404);
});
test("stats route supports both reading and input validation", async () => {
  const r = await fetch(`${base}/api/stats`);
  assert.equal(r.status, 200);
  assert.ok(Array.isArray((await r.json()).top));
  assert.equal((await fetch(`${base}/api/stats`, { method: "POST", body: "{}" })).status, 400);
});
test("cross-origin API writes are rejected", async () => {
  for (const path of ["ai", "auth", "stats", "shares"]) {
    const r = await fetch(`${base}/api/${path}`, { method: "POST", headers: { Origin: "https://untrusted.example" }, body: "{}" });
    assert.equal(r.status, 403);
  }
});
test("private sharing route is mounted and requires a signed-in account", async () => {
  const response = await fetch(`${base}/api/shares`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "signin_required");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("server-only files and unknown routes are not exposed", async () => {
  for (const path of ["/netlify/lib/prompts.mjs", "/.data/accounts", "/.env", "/source/data.json", "/api/nope"]) {
    assert.equal((await fetch(`${base}${path}`)).status, 404);
  }
});
test("oversized requests are rejected", async () => {
  const r = await fetch(`${base}/api/stats`, { method: "POST", body: "x".repeat(450001) });
  assert.equal(r.status, 413);
});
test("local stores persist across instances, isolate names, and delete records", async () => {
  const key = randomUUID();
  const a = getStore("council-test");
  const b = getStore("council-test");
  const other = getStore("council-test-other");
  try {
    assert.equal(await a.get(key), null);
    await a.setJSON(key, { count: 2 });
    assert.deepEqual(await b.get(key, { type: "json" }), { count: 2 });
    assert.equal(await other.get(key), null);
    await b.delete(key);
    assert.equal(await a.get(key), null);
  } finally { await a.delete(key); }
});
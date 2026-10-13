import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
process.env.REQUIRE_SIGNIN = "1";
process.env.MOONSHOT_API_KEY = "test-placeholder-not-a-real-key";
process.env.DAILY_CALL_LIMIT = "1";
process.env.CALLS_PER_ACCOUNT_DAY = "1";
delete process.env.SITE_PASSKEY;
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: ai } = await import("../netlify/functions/ai.mts");
const { default: auth } = await import("../netlify/functions/auth.mts");
const { acctKey, setJSON, getJSON, del, sha, randomHex, SESSION_COOKIE, quota, isPremiumAccount, DAY } = await import("../netlify/lib/auth.mts");
const { getStore } = await import("../netlify/lib/store.mts");
const realFetch = globalThis.fetch;
const originalGrant = process.env.PREMIUM_ACCOUNT_EMAILS;
const touched = new Set();
const usageKeys = new Set();
after(async () => {
  globalThis.fetch = realFetch;
  if (originalGrant === undefined) delete process.env.PREMIUM_ACCOUNT_EMAILS;
  else process.env.PREMIUM_ACCOUNT_EMAILS = originalGrant;
  for (const key of touched) await del(key);
  for (const key of usageKeys) await getStore("council-usage").delete(key);
});
async function account() {
  const email = `premium-test-${randomUUID()}@example.com`;
  const key = await acctKey(email), token = randomHex(32), session = "sess/" + await sha(token);
  const acct = { email, name: "Premium Test", passwordHash: "not-used-by-these-tests", starts: [Date.now() - 1000, Date.now() - 500], ids: {}, calls: { [new Date().toISOString().slice(0, 10)]: 120 } };
  await setJSON(key, acct);
  await setJSON(session, { email, kind: "password", exp: Date.now() + DAY });
  touched.add(key); touched.add(session);
  return { key, email, acct, cookie: `${SESSION_COOKIE}=${token}` };
}
function request(user, did) {
  return new Request("https://council.test/api/ai", {
    method: "POST", headers: { Cookie: user.cookie, Origin: "https://council.test", "Content-Type": "application/json", "X-Council-Discussion": did },
    body: JSON.stringify({ task: "pick", q: "A test question", count: 2, lang: "en", premium: true, unlimited: true })
  });
}
test("premium grants are exact, server-only and require an existing password account", async () => {
  const user = await account();
  process.env.PREMIUM_ACCOUNT_EMAILS = `  ${user.email.toUpperCase()}  `;
  assert.equal(isPremiumAccount(user.acct), true);
  assert.equal(isPremiumAccount({ ...user.acct, email: "other-" + user.email }), false);
  assert.equal(isPremiumAccount({ ...user.acct, passwordHash: "" }), false);
  assert.equal(isPremiumAccount(null), false);
  const q = quota(user.acct);
  assert.equal(q.unlimited, true);
  assert.equal(q.resetAt, null);
  assert.equal(q.left, Number.MAX_SAFE_INTEGER);
  const status = await auth(new Request("https://council.test/api/auth", { headers: { Cookie: user.cookie } }), {});
  const data = await status.json();
  assert.equal(data.plan, "premium");
  assert.equal(data.premium, true);
  assert.equal(data.unlimited, true);
  process.env.PREMIUM_ACCOUNT_EMAILS = "";
  assert.equal(quota(user.acct).unlimited, false);
  assert.equal(quota(user.acct).left, 0);
});
test("premium bypasses discussion, per-account AI and shared-IP caps; standard users do not", async () => {
  const premium = await account(), standard = await account();
  const ip = `premium-test-${randomUUID()}`, day = new Date().toISOString().slice(0, 10);
  const usageKey = `${day}/${ip}`;
  usageKeys.add(usageKey);
  await getStore("council-usage").set(usageKey, "999");
  process.env.PREMIUM_ACCOUNT_EMAILS = premium.email;
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls++;
    return new Response('data: {"choices":[{"delta":{"content":"Test answer"}}]}\n\ndata: [DONE]\n\n', { headers: { "Content-Type": "text/event-stream" } });
  };
  try {
    for (const did of ["premium-one", "premium-two", "premium-three"]) {
      const response = await ai(request(premium, did), { ip });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-council-unlimited"), "true");
      assert.equal(await response.text(), "Test answer");
    }
    assert.equal(providerCalls, 3);
    assert.equal((await getJSON(premium.key)).calls[day], 123);
    const blocked = await ai(request(standard, "standard-new"), { ip });
    assert.equal(blocked.status, 429);
    assert.equal((await blocked.json()).code, "quota_exceeded");
    const record = await getJSON(standard.key);
    record.ids["standard-existing"] = Date.now();
    await setJSON(standard.key, record);
    const callsBlocked = await ai(request(standard, "standard-existing"), { ip });
    assert.equal(callsBlocked.status, 429);
    assert.equal((await callsBlocked.json()).message, "daily call limit");
    record.starts = []; record.calls = {};
    await setJSON(standard.key, record);
    const ipBlocked = await ai(request(standard, "standard-fresh"), { ip });
    assert.equal(ipBlocked.status, 429);
    assert.equal((await ipBlocked.json()).message, "daily limit");
    // Anonymous users cannot gain the grant from body fields or a discussion ID.
    const anonymous = await ai(request({ cookie: "" }, "premium-one"), { ip });
    assert.equal(anonymous.status, 401);
    assert.equal(providerCalls, 3);
  } finally { globalThis.fetch = realFetch; }
});

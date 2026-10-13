import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
process.env.REQUIRE_SIGNIN = "1";
process.env.DAILY_CALL_LIMIT = "0";
process.env.MOONSHOT_API_KEY = "test-placeholder-not-a-real-key";
delete process.env.RESEND_API_KEY;
delete process.env.SITE_PASSKEY;
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: auth } = await import("../netlify/functions/auth.mts");
const { default: ai } = await import("../netlify/functions/ai.mts");
const { getJSON, setJSON, del, acctKey, sessionFrom, SESSION_COOKIE, sha, DAY } = await import("../netlify/lib/auth.mts");
const { hashPassword, verifyPassword } = await import("../netlify/lib/passwords.mts");
const realFetch = globalThis.fetch;
after(() => { globalThis.fetch = realFetch; });
const touched = new Set();
const email = () => `test-${randomUUID()}@example.com`;
const request = (action, data = {}, cookie = "", path = "auth") => new Request(`https://council.test/api/${path}`, {
  method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie, Origin: "https://council.test" },
  body: JSON.stringify({ action, ...data }),
});
const getCookie = r => r.headers.get("set-cookie").split(";")[0];
after(async () => { for (const key of touched) await del(key); });

test("password hashing is salted, verifiable, and rejects malformed records", async () => {
  const pw = "A unique test passphrase!";
  const first = await hashPassword(pw), second = await hashPassword(pw);
  assert.notEqual(first, second);
  assert.equal(first.includes(pw), false);
  assert.equal(await verifyPassword(pw, first), true);
  assert.equal(await verifyPassword("Another wrong passphrase", first), false);
  assert.equal(await verifyPassword(pw, "invalid"), false);
});
test("signup, cookie session, signin, signout and expiry work without any emails", async () => {
  const address = email(), key = await acctKey(address); touched.add(key);
  const ctx = { ip: randomUUID() };
  let calls = 0; globalThis.fetch = async () => { calls++; throw new Error("No network allowed"); };
  const signup = await auth(request("signup", { name: "Test Council Member", email: address.toUpperCase(), password: "A secure testing password!" }), ctx);
  assert.equal(signup.status, 200);
  assert.match(signup.headers.get("set-cookie"), /HttpOnly/);
  assert.match(signup.headers.get("set-cookie"), /Secure/);
  assert.match(signup.headers.get("set-cookie"), /Partitioned/);
  const body = await signup.json();
  assert.equal(body.name, "Test Council Member");
  assert.equal(body.email, address);
  assert.equal(body.limit, 2);
  assert.equal(body.token, undefined);
  assert.equal(body.passwordHash, undefined);
  assert.equal(calls, 0);
  const cookie = getCookie(signup);
  const sess = await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } })); touched.add(sess.key);
  const record = await getJSON(key);
  assert.ok(record.passwordHash.startsWith("scrypt-v1$"));
  assert.equal(record.password, undefined);
  const status = await auth(new Request("https://council.test/api/auth", { headers: { Cookie: cookie } }), ctx);
  assert.equal((await status.json()).name, "Test Council Member");
  const duplicate = await auth(request("signup", { name: "Other", email: address, password: "An entirely different password!" }), ctx);
  assert.equal(duplicate.status, 409);
  assert.equal((await getJSON(key)).name, "Test Council Member");
  assert.equal((await auth(request("signin", { email: address, password: "An incorrect test password!" }), ctx)).status, 401);
  const logout = await auth(request("signout", {}, cookie), ctx);
  assert.equal(logout.status, 200); assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } })), null);
  const login = await auth(request("signin", { email: address, password: "A secure testing password!" }), ctx);
  assert.equal(login.status, 200);
  const nextCookie = getCookie(login);
  const nextSess = await sessionFrom(new Request("https://council.test", { headers: { Cookie: nextCookie } })); touched.add(nextSess.key);
  await setJSON(nextSess.key, { email: address, kind: "password", exp: Date.now() - 1 });
  assert.equal(await sessionFrom(new Request("https://council.test", { headers: { Cookie: nextCookie } })), null);
  globalThis.fetch = realFetch;
});
test("validation, unknown account errors, old email actions and cross-origin writes are rejected", async () => {
  const ctx = { ip: randomUUID() }, address = email();
  assert.equal((await auth(request("signup", { name: "", email: address, password: "A secure password!" }), ctx)).status, 400);
  assert.equal((await auth(request("signup", { name: "Name", email: "bad", password: "A secure password!" }), ctx)).status, 400);
  assert.equal((await auth(request("signup", { name: "Name", email: address, password: "short" }), ctx)).status, 400);
  const unknown = await auth(request("signin", { email: address, password: "A secure password!" }), ctx);
  assert.equal(unknown.status, 401); assert.equal((await unknown.json()).code, "invalid_credentials");
  assert.equal((await auth(request("start", { email: address }), ctx)).status, 400);
  const cross = new Request("https://council.test/api/auth", { method: "POST", headers: { Origin: "https://evil.test", "Content-Type": "application/json" }, body: '{"action":"signout"}' });
  assert.equal((await auth(cross, ctx)).status, 403);
});
test("parallel password attempts respect per-account throttling", async () => {
  const address = email(), ctx = { ip: randomUUID() };
  const results = await Promise.all(Array.from({ length: 12 }, () => auth(request("signin", { email: address, password: "Wrong testing passphrase!" }), ctx)));
  assert.equal(results.filter(r => r.status === 401).length, 10);
  assert.equal(results.filter(r => r.status === 429).length, 2);
});
test("offline recovery resets the password once, invalidates sessions, and preserves account usage", async () => {
  const address = email(), key = await acctKey(address), ctx = { ip: randomUUID() };
  touched.add(key);
  const signup = await auth(request("signup", { name: "Recovery Member", email: address, password: "Original account passphrase!" }), ctx);
  const cookie = getCookie(signup);
  const sess = await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } }));
  touched.add(sess.key);
  const initial = await getJSON(key);
  initial.starts = [Date.now() - 1000];
  initial.ids = { "saved-discussion": Date.now() - 1000 };
  initial.calls = { "2026-10-11": 17 };
  await setJSON(key, initial);

  const generated = await auth(request("generate-recovery", {}, cookie), ctx);
  assert.equal(generated.status, 200);
  const { codes } = await generated.json();
  assert.equal(codes.length, 10);
  assert.ok(codes.every(code => /^[A-F0-9]{4}(?:-[A-F0-9]{4}){7}$/.test(code)));
  const withCodes = await getJSON(key);
  assert.equal(withCodes.recoveryHashes.length, 10);
  assert.ok(withCodes.recoveryHashes.every(hash => /^[a-f0-9]{64}$/.test(hash)));
  assert.ok(codes.every(code => !JSON.stringify(withCodes).includes(code)));
  const status = await auth(new Request("https://council.test/api/auth", { headers: { Cookie: cookie } }), ctx);
  const statusBody = await status.json();
  assert.equal(statusBody.recoveryCodesAvailable, true);
  assert.equal(statusBody.codes, undefined);

  const bad = await auth(request("reset-password", { email: address, code: "0000-0000-0000-0000-0000-0000-0000-0000", password: "Updated recovery passphrase!" }), ctx);
  assert.equal(bad.status, 401);
  assert.equal((await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } }))).email, address);

  const chosen = codes[0], newPassword = "Updated recovery passphrase!";
  const attempts = await Promise.all([
    auth(request("reset-password", { email: address, code: chosen, password: newPassword }, cookie), ctx),
    auth(request("reset-password", { email: address, code: chosen, password: newPassword }, cookie), ctx),
  ]);
  assert.equal(attempts.filter(r => r.status === 200).length, 1);
  assert.equal(attempts.filter(r => r.status === 401).length, 1);
  assert.match(attempts.find(r => r.status === 200).headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } })), null);
  const afterReset = await getJSON(key);
  assert.deepEqual(afterReset.starts, initial.starts);
  assert.deepEqual(afterReset.ids, initial.ids);
  assert.deepEqual(afterReset.calls, initial.calls);

  const reused = await auth(request("reset-password", { email: address, code: chosen, password: "Another reset passphrase!" }), ctx);
  assert.equal(reused.status, 401);
  assert.equal((await auth(request("signin", { email: address, password: "Original account passphrase!" }), ctx)).status, 401);
  assert.equal((await auth(request("signin", { email: address, password: newPassword }), ctx)).status, 200);
});
test("recovery code attempts are throttled per account", async () => {
  const address = email(), ctx = { ip: randomUUID() };
  const attempts = await Promise.all(Array.from({ length: 7 }, () => auth(
    request("reset-password", { email: address, code: "0000-0000-0000-0000-0000-0000-0000-0000", password: "A valid testing passphrase!" }),
    ctx,
  )));
  assert.equal(attempts.filter(r => r.status === 401).length, 5);
  assert.equal(attempts.filter(r => r.status === 429).length, 2);
});
test("account discussion and call limits survive signout/signin and concurrent requests", async () => {
  const address = email(), key = await acctKey(address); touched.add(key);
  const ctx = { ip: randomUUID() };
  const signup = await auth(request("signup", { name: "Quota Member", email: address, password: "Quota testing passphrase!" }), ctx);
  const cookie = getCookie(signup);
  const sess = await sessionFrom(new Request("https://council.test", { headers: { Cookie: cookie } })); touched.add(sess.key);
  let upstream = 0;
  globalThis.fetch = async () => { upstream++; return new Response('data: {"choices":[{"delta":{"content":"test"}}]}\n\n'); };
  const pick = id => new Request("https://council.test/api/ai", {
    method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json", "X-Council-Discussion": id },
    body: JSON.stringify({ task: "pick", q: "A quota-only test question", count: 2 }),
  });
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => ai(pick(`d-${i}`), ctx)));
  assert.equal(results.filter(r => r.status === 200).length, 2);
  assert.equal(results.filter(r => r.status === 429).length, 6);
  assert.equal(upstream, 2);
  const acct = await getJSON(key), existing = Object.keys(acct.ids)[0];
  const again = await ai(pick(existing), ctx);
  assert.equal(again.status, 200);
  await auth(request("signout", {}, cookie), ctx);
  const login = await auth(request("signin", { email: address, password: "Quota testing passphrase!" }), ctx);
  assert.equal((await login.json()).left, 0);
  const nextCookie = getCookie(login);
  const nextSess = await sessionFrom(new Request("https://council.test", { headers: { Cookie: nextCookie } })); touched.add(nextSess.key);
  const latest = await getJSON(key);
  latest.calls = { [new Date().toISOString().slice(0, 10)]: 120 };
  await setJSON(key, latest);
  const cap = new Request(pick(existing), { headers: { Cookie: nextCookie, "Content-Type": "application/json", "X-Council-Discussion": existing } });
  assert.equal((await ai(cap, ctx)).status, 429);
  const unsigned = new Request(pick("unsigned"), { headers: { "Content-Type": "application/json" } });
  assert.equal((await ai(unsigned, ctx)).status, 401);
  await Promise.all(results.map(r => r.text())); await again.text();
  globalThis.fetch = realFetch;
});
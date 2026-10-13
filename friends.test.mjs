import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: friends } = await import("../netlify/functions/friends.mts");
const { acctKey, sha, setJSON, del, randomHex, SESSION_COOKIE } = await import("../netlify/lib/auth.mts");
const { getStore } = await import("../netlify/lib/store.mts");
const touched = [];
const social = getStore("council-friends");
const socialKeys = new Set();
after(async () => {
  for (const key of touched) await del(key);
  for (const key of socialKeys) await social.delete(key);
});
async function user(name) {
  const email = `friends-test-${randomUUID()}@example.com`;
  const account = await acctKey(email);
  const token = randomHex(32), session = "sess/" + await sha(token);
  await setJSON(account, { email, name, passwordHash: "not-used-by-friends-tests", starts: [], ids: {} });
  await setJSON(session, { email, kind: "password", exp: Date.now() + 60000 });
  touched.push(account, session);
  const result = { cookie: `${SESSION_COOKIE}=${token}`, email };
  const loaded = await call(result);
  result.profile = loaded.body.profile;
  socialKeys.add("profile/" + await sha(email));
  socialKeys.add("code/" + result.profile.code);
  return result;
}
async function call(user, action, data = {}, headers = {}) {
  const req = new Request("https://council.test/api/friends", {
    method: action ? "POST" : "GET",
    headers: { Cookie: user?.cookie || "", ...(action ? { "Content-Type": "application/json", Origin: "https://council.test" } : {}), ...headers },
    ...(action ? { body: JSON.stringify({ action, ...data }) } : {})
  });
  const response = await friends(req);
  return { status: response.status, body: await response.json() };
}

test("friend codes, private requests, recipient-only acceptance, removal and persistence", async () => {
  const a = await user("Alice"), b = await user("Bob"), c = await user("Unrelated");
  assert.match(a.profile.code, /^[A-F0-9]{12}$/);
  assert.equal((await call(null)).status, 401);
  assert.equal((await call(a, "request", { code: b.profile.code.match(/.{4}/g).join("-") })).status, 200);
  const av = (await call(a)).body, bv = (await call(b)).body;
  assert.equal(av.outgoing[0].name, "Bob");
  assert.equal(bv.incoming[0].name, "Alice");
  assert.equal(JSON.stringify(bv).includes(a.email), false);
  assert.equal(JSON.stringify(bv).includes("profile/"), false);
  assert.equal((await call(c, "accept", { id: a.profile.id })).status, 409);
  assert.equal((await call(a, "accept", { id: b.profile.id })).status, 409);
  assert.equal((await call(b, "accept", { id: a.profile.id })).status, 200);
  assert.equal((await call(a)).body.friends[0].id, b.profile.id);
  assert.equal((await call(b)).body.friends[0].id, a.profile.id);
  assert.equal((await call(a, "request", { code: b.profile.code })).body.code, "already_friends");
  assert.equal((await call(a, "remove", { id: b.profile.id })).status, 200);
  assert.equal((await call(b)).body.friends.length, 0);
});
test("decline, cancellation, duplicate and crossed requests, block and unblock", async () => {
  const a = await user("First"), b = await user("Second");
  assert.equal((await call(a, "request", { code: a.profile.code })).body.code, "self_request");
  assert.equal((await call(a, "request", { code: "bad" })).body.code, "invalid_code");
  await call(a, "request", { code: b.profile.code });
  assert.equal((await call(a, "request", { code: b.profile.code })).body.code, "request_exists");
  assert.equal((await call(b, "request", { code: a.profile.code })).body.code, "request_received");
  assert.equal((await call(b, "decline", { id: a.profile.id })).status, 200);
  assert.equal((await call(a)).body.outgoing.length, 0);
  await call(a, "request", { code: b.profile.code });
  await call(a, "cancel", { id: b.profile.id });
  assert.equal((await call(b)).body.incoming.length, 0);
  await call(a, "request", { code: b.profile.code });
  await call(b, "block", { id: a.profile.id });
  assert.equal((await call(a)).body.outgoing.length, 0);
  assert.equal((await call(a, "request", { code: b.profile.code })).body.code, "friend_not_available");
  assert.equal((await call(b)).body.blocked[0].id, a.profile.id);
  await call(b, "unblock", { id: a.profile.id });
  assert.equal((await call(a, "request", { code: b.profile.code })).status, 200);
});
test("simultaneous requests cannot duplicate or lose the two-sided relation", async () => {
  const a = await user("Concurrent A"), b = await user("Concurrent B");
  const results = await Promise.all(Array.from({ length: 8 }, () => call(a, "request", { code: b.profile.code })));
  assert.equal(results.filter(r => r.status === 200).length, 1);
  assert.equal((await call(a)).body.outgoing.length, 1);
  assert.equal((await call(b)).body.incoming.length, 1);
  const accepted = await Promise.all([call(b, "accept", { id: a.profile.id }), call(b, "accept", { id: a.profile.id })]);
  assert.equal(accepted.filter(r => r.status === 200).length, 1);
  assert.equal((await call(a)).body.friends.length, 1);
});
test("invalid payloads, CSRF and code-guessing limits fail explicitly", async () => {
  const a = await user("Protected");
  assert.equal((await call(a, "request", { code: "123456ABCDEF" }, { Origin: "https://evil.test" })).status, 403);
  assert.equal((await call(a, "request", {}, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  assert.equal((await call(a, "unknown")).status, 400);
  assert.equal((await call(a, "accept", { id: "../private" })).status, 400);
  for (let i = 0; i < 20; i++) assert.equal((await call(a, "request", { code: "INVALID" })).status, 400);
  assert.equal((await call(a, "request", { code: "INVALID" })).status, 429);
});

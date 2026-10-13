import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: shares } = await import("../netlify/functions/shares.mts");
const { default: friends } = await import("../netlify/functions/friends.mts");
const { acctKey, sha, setJSON, del, randomHex, SESSION_COOKIE } = await import("../netlify/lib/auth.mts");
const { getStore } = await import("../netlify/lib/store.mts");
const records = [];
after(async () => {
  for (const [store, key] of records) {
    if (store) await getStore(store).delete(key);
    else await del(key);
  }
});
async function call(handler, user, body, id, headers = {}) {
  const response = await handler(new Request("https://council.test/api/shares" + (id ? "?id=" + id : ""), {
    method: body ? "POST" : "GET",
    headers: { Cookie: user?.cookie || "", ...(body ? { Origin: "https://council.test", "Content-Type": "application/json" } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {})
  }));
  const result = { status: response.status, body: await response.json() };
  assert.equal(response.headers.get("cache-control"), "no-store");
  return result;
}
async function user(name) {
  const email = `shares-${randomUUID()}@example.com`, token = randomHex(32);
  const account = await acctKey(email), session = "sess/" + await sha(token);
  await setJSON(account, { email, name, passwordHash: "test-only", starts: [], ids: {} });
  await setJSON(session, { email, kind: "password", exp: Date.now() + 60000 });
  records.push([null, account], [null, session]);
  const u = { cookie: `${SESSION_COOKIE}=${token}`, email, key: "profile/" + await sha(email) };
  u.profile = (await call(friends, u)).body.profile;
  records.push(["council-friends", u.key], ["council-friends", "code/" + u.profile.code], ["council-shares", "index/" + u.key]);
  return u;
}
async function connect(a, b) {
  assert.equal((await call(friends, a, { action: "request", code: b.profile.code })).status, 200);
  assert.equal((await call(friends, b, { action: "accept", id: a.profile.id })).status, 200);
}
const full = () => ({
  kind: "full", question: "PRIVATE question", context: "PRIVATE context",
  entries: [{ author: "Perspective", text: "<script>alert('private')</script> A full insight", demo: true },
    { author: "You", text: "PRIVATE host input", demo: false }],
  brief: "PRIVATE brief", demo: true,
  secret: "never persist", preferences: { token: "never persist" }
});
async function create(owner, guest, snapshot = full()) {
  const res = await call(shares, owner, { action: "create", snapshot, friendIds: [guest.profile.id] });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  records.push(["council-shares", "share/" + res.body.share.id]);
  return res.body.share.id;
}

test("sharing is explicit, immutable, allowlisted and only accepted recipients can read", async () => {
  const owner = await user("Owner"), guest = await user("Guest"), stranger = await user("Stranger"), pending = await user("Pending");
  assert.deepEqual((await call(shares, owner)).body, { owned: [], received: [] });
  assert.equal((await call(shares, null)).status, 401);
  await call(friends, owner, { action: "request", code: pending.profile.code });
  assert.equal((await call(shares, owner, { action: "create", snapshot: full(), friendIds: [pending.profile.id] })).status, 403);
  await connect(owner, guest);
  const input = full(), id = await create(owner, guest, input);
  input.question = "later local edit";
  const detail = await call(shares, guest, null, id);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.owner, false);
  assert.equal(detail.body.grants, undefined);
  assert.equal(detail.body.share.snapshot.question, "PRIVATE question");
  assert.equal(detail.body.share.snapshot.entries[0].text, full().entries[0].text);
  assert.equal(detail.body.share.snapshot.entries[0].demo, true);
  const stored = await getStore("council-shares").get("share/" + id, { type: "json" });
  assert.equal(stored.snapshot.secret, undefined);
  assert.equal(stored.snapshot.preferences, undefined);
  assert.equal(JSON.stringify(detail.body).includes("profile/"), false);
  assert.equal(JSON.stringify(detail.body).includes(owner.email), false);
  assert.equal((await call(shares, stranger, null, id)).status, 403);
  assert.equal((await call(shares, pending, null, id)).status, 403);
  assert.equal((await call(shares, null, null, id)).status, 401);
  assert.equal((await call(shares, stranger)).body.received.length, 0);
  assert.equal((await call(shares, guest)).body.received[0].id, id);
  assert.equal((await call(shares, owner)).body.owned[0].recipients, 1);
  assert.equal(JSON.stringify((await call(shares, guest)).body).includes("PRIVATE context"), false);
  for (const action of ["grant", "revoke", "delete"]) {
    assert.equal((await call(shares, guest, { action, id, friendIds: [stranger.profile.id], friendId: guest.profile.id })).status, 403);
  }
  assert.equal((await call(shares, owner, { action: "grant", id, friendIds: [stranger.profile.id] })).status, 403);
});

test("selected insights and briefs exclude all unselected/private content", async () => {
  const owner = await user("Selective owner"), guest = await user("Selective guest");
  await connect(owner, guest);
  const insight = { ...full(), kind: "insights", entries: [{ author: "Selected", text: "Chosen insight", demo: false }] };
  const insightId = await create(owner, guest, insight);
  const selected = (await call(shares, guest, null, insightId)).body.share.snapshot;
  assert.deepEqual(Object.keys(selected).sort(), ["demo", "entries", "kind", "question"]);
  assert.equal(selected.entries.length, 1);
  assert.equal(JSON.stringify(selected).includes("PRIVATE context"), false);
  assert.equal(JSON.stringify(selected).includes("PRIVATE brief"), false);
  const briefId = await create(owner, guest, { ...full(), kind: "brief" });
  const brief = (await call(shares, guest, null, briefId)).body.share.snapshot;
  assert.deepEqual(Object.keys(brief).sort(), ["brief", "demo", "kind", "question"]);
  assert.equal(brief.entries, undefined);
  assert.equal(brief.context, undefined);
});

test("owner revocation, renewed grants and deletion enforce membership on every read", async () => {
  const owner = await user("Revoking owner"), guest = await user("Revoked guest");
  await connect(owner, guest);
  const id = await create(owner, guest);
  const results = await Promise.all([
    call(shares, owner, { action: "revoke", id, friendId: guest.profile.id }),
    call(shares, owner, { action: "revoke", id, friendId: guest.profile.id })
  ]);
  assert.ok(results.every(r => r.status === 200));
  assert.equal((await call(shares, guest, null, id)).status, 403);
  assert.equal((await call(shares, guest)).body.received.length, 0);
  assert.equal((await call(shares, owner, null, id)).body.grants.length, 0);
  assert.equal((await call(shares, owner, { action: "grant", id, friendIds: [guest.profile.id] })).status, 200);
  assert.equal((await call(shares, guest, null, id)).status, 200);
  // A stale index plus a still-present grant is insufficient without both sides
  // of the friendship. This simulates incomplete legacy storage too.
  const profiles = getStore("council-friends");
  const peer = await profiles.get(guest.key, { type: "json" });
  delete peer.peers[owner.profile.id];
  await profiles.setJSON(guest.key, peer);
  assert.equal((await call(shares, guest, null, id)).status, 403);
  assert.equal((await call(shares, guest)).body.received.length, 0);
  assert.equal((await call(shares, owner, { action: "delete", id })).status, 200);
  assert.equal(await getStore("council-shares").get("share/" + id, { type: "json" }), null);
  assert.equal((await call(shares, guest, null, id)).status, 404);
  assert.equal((await call(shares, owner)).body.owned.length, 0);
});

test("removal and blocking by either side permanently revoke snapshots after reconnecting", async () => {
  for (const action of ["remove", "block"]) {
    for (const actor of ["owner", "guest"]) {
      const owner = await user("Owner"), guest = await user("Guest");
      await connect(owner, guest);
      const id = await create(owner, guest);
      const a = actor === "owner" ? owner : guest, b = actor === "owner" ? guest : owner;
      assert.equal((await call(friends, a, { action, id: b.profile.id })).status, 200);
      assert.equal((await call(shares, guest, null, id)).status, 403);
      assert.equal((await call(shares, guest)).body.received.length, 0);
      assert.equal((await call(shares, owner, null, id)).body.grants.length, 0);
      if (action === "block") await call(friends, a, { action: "unblock", id: b.profile.id });
      await connect(owner, guest);
      assert.equal((await call(shares, guest, null, id)).status, 403);
      await call(shares, owner, { action: "grant", id, friendIds: [guest.profile.id] });
      assert.equal((await call(shares, guest, null, id)).status, 200);
    }
  }
});

test("CSRF, malformed, oversized and empty snapshot requests fail without creating records", async () => {
  const owner = await user("Protected owner"), guest = await user("Guest");
  await connect(owner, guest);
  const body = snapshot => ({ action: "create", snapshot, friendIds: [guest.profile.id] });
  assert.equal((await call(shares, owner, body(full()), null, { Origin: "https://evil.test" })).status, 403);
  assert.equal((await call(shares, owner, body(full()), null, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  for (const snapshot of [null, {}, { ...full(), question: "" }, { ...full(), kind: "other" },
    { ...full(), entries: [null] }, { ...full(), entries: Array(601).fill(full().entries[0]) },
    { ...full(), kind: "insights", entries: [] }, { ...full(), kind: "brief", brief: "" },
    { ...full(), context: "x".repeat(10001) }, { ...full(), brief: "x".repeat(24001) }]) {
    assert.equal((await call(shares, owner, body(snapshot))).status, 400);
  }
  assert.equal((await call(shares, owner, { ...body(full()), friendIds: [] })).status, 400);
  assert.equal((await call(shares, owner, { ...body(full()), friendIds: [guest.profile.id, guest.profile.id] })).status, 400);
  assert.equal((await call(shares, owner, body({ ...full(), brief: "x".repeat(400001) }))).status, 413);
  assert.equal((await call(shares, owner, null, "bad-id")).status, 400);
  assert.deepEqual((await call(shares, owner)).body, { owned: [], received: [] });
});

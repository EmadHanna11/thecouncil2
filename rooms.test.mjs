import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

process.env.COUNCIL_LOCAL_RUNTIME = "1";
process.env.COUNCIL_TEST_STORAGE = "1";
process.env.REQUIRE_SIGNIN = "1";
process.env.AI_PROVIDER = "kimi";
process.env.MOONSHOT_API_KEY = "unit-test-only-not-a-real-key";
process.env.AI_FALLBACK_PROVIDER = "";
process.env.CALLS_PER_ACCOUNT_DAY = "3";
process.env.DAILY_CALL_LIMIT = "0";
delete process.env.SITE_PASSKEY;
globalThis.Netlify = { env: { get: key => process.env[key] } };
const { default: rooms } = await import("../netlify/functions/rooms.mts");
const { default: friends } = await import("../netlify/functions/friends.mts");
const { default: ai } = await import("../netlify/functions/ai.mts");
const { acctKey, sha, setJSON, getJSON, del, randomHex, SESSION_COOKIE } = await import("../netlify/lib/auth.mts");
const { getStore } = await import("../netlify/lib/store.mts");
const { BY_ID } = await import("../netlify/lib/prompts.mjs");
const touched = [];
const records = [];
const fetchOriginal = globalThis.fetch;
let prompts = [];
globalThis.fetch = async (_url, options) => {
  prompts.push(JSON.parse(options.body).messages[0].content);
  return new Response('data: {"choices":[{"delta":{"content":"AI answer\\nSTANCE: 1 | test"}}]}\n\n');
};
after(async () => {
  globalThis.fetch = fetchOriginal;
  for (const key of touched) await del(key);
  for (const [store, key] of records) await getStore(store).delete(key);
});
async function user(name) {
  const email = `rooms-${randomUUID()}@example.com`, token = randomHex(32);
  const account = await acctKey(email), session = "sess/" + await sha(token);
  await setJSON(account, { email, name, passwordHash: "not-used", starts: [], ids: {} });
  await setJSON(session, { email, kind: "password", exp: Date.now() + 60000 });
  touched.push(account, session);
  const u = { cookie: `${SESSION_COOKIE}=${token}`, email, account };
  u.profile = (await call(friends, u)).body.profile;
  const profileKey = "profile/" + await sha(email);
  records.push(["council-friends", profileKey], ["council-friends", "code/" + u.profile.code],
    ["council-rooms", "index/" + profileKey]);
  return u;
}
async function call(handler, user, body, id, headers = {}) {
  const req = new Request("https://council.test/api/rooms" + (id ? "?id=" + id : ""), {
    method: body ? "POST" : "GET",
    headers: { Cookie: user?.cookie || "", ...(body ? { "Content-Type": "application/json", Origin: "https://council.test" } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const response = await handler(req, { ip: "isolated-room-tests" });
  const text = await response.text();
  return { status: response.status, body: response.headers.get("content-type")?.includes("json") ? JSON.parse(text) : text };
}
async function connect(a, b) {
  await call(friends, a, { action: "request", code: b.profile.code });
  assert.equal((await call(friends, b, { action: "accept", id: a.profile.id })).status, 200);
}
async function create(host) {
  const s = { id: randomHex(12), question: "Private room test", context: "PRIVATE history context", seats: [[...BY_ID.keys()][0]],
    mode: "explore", lang: "en", messages: [{ id: "old", type: "host", text: "PRIVATE earlier message" }], synthesis: "PRIVATE existing brief" };
  const result = await call(rooms, host, { action: "create", s });
  assert.equal(result.status, 200);
  records.push(["council-rooms", "room/" + result.body.room.id]);
  return result.body.room;
}
async function invite(host, guest, room, role) {
  assert.equal((await call(rooms, host, { action: "invite", id: room.id, friendId: guest.profile.id, role })).status, 200);
}

test("discussion invitations reuse only the host's open room, atomically and without copying later edits", async () => {
  const host = await user("Invitation host"), guest = await user("Invitation guest");
  await connect(host, guest);
  const original = await create(host);
  const edited = { ...original.s, context: "Later browser edits must stay private" };
  const repeated = await Promise.all(Array.from({ length: 4 }, () => call(rooms, host, { action: "create", s: edited, reuse: true })));
  for (const result of repeated) {
    assert.equal(result.status, 200);
    assert.equal(result.body.room.id, original.id);
    assert.equal(result.body.room.s.context, "PRIVATE history context");
  }
  const list = (await call(rooms, host)).body.rooms;
  assert.equal(list.length, 1);
  assert.equal(list[0].discussionId, original.s.id);
  await invite(host, guest, original, "viewer");
  assert.equal((await call(rooms, guest)).body.rooms[0].discussionId, undefined);
  const otherHost = await call(rooms, guest, { action: "create", s: edited, reuse: true });
  assert.equal(otherHost.status, 200);
  assert.notEqual(otherHost.body.room.id, original.id);
  records.push(["council-rooms", "room/" + otherHost.body.room.id]);
  await call(rooms, host, { action: "close", id: original.id });
  const replacement = await call(rooms, host, { action: "create", s: edited, reuse: true });
  assert.equal(replacement.status, 200);
  assert.notEqual(replacement.body.room.id, original.id);
  assert.equal(replacement.body.room.s.context, edited.context);
  records.push(["council-rooms", "room/" + replacement.body.room.id]);
});

test("private invitations disclose history before acceptance; unauthorized users never see transcripts", async () => {
  const host = await user("Host"), guest = await user("Guest"), stranger = await user("Stranger");
  await connect(host, guest);
  const room = await create(host);
  assert.equal((await call(rooms, null)).status, 401);
  assert.equal((await call(rooms, stranger, null, room.id)).status, 403);
  assert.equal((await call(rooms, host, { action: "invite", id: room.id, friendId: stranger.profile.id, role: "viewer" })).status, 403);
  await invite(host, guest, room, "viewer");
  const preview = (await call(rooms, guest)).body.rooms[0];
  assert.equal(preview.role, "viewer");
  assert.deepEqual(preview.history, { messages: 1, hasBrief: true, includesContext: true });
  assert.equal(JSON.stringify(preview).includes("PRIVATE"), false);
  assert.equal((await call(rooms, guest, null, room.id)).status, 403);
  const accepted = await call(rooms, guest, { action: "accept", id: room.id, role: "member" });
  assert.equal(accepted.body.me.role, "viewer");
  assert.equal((await call(rooms, host, null, room.id)).body.room.participants.find(p => p.id === guest.profile.id).status, "accepted");
  assert.equal(accepted.body.room.s.context, "PRIVATE history context");
  assert.equal(JSON.stringify(accepted.body).includes(host.email), false);
  assert.equal(JSON.stringify(accepted.body).includes("profile/"), false);
  for (const action of ["invite", "remove", "close", "host-message", "feedback", "submit", "skip", "ai", "human-round"]) {
    const res = await call(rooms, guest, { action, id: room.id, text: "tamper", task: "contribute", friendId: host.profile.id, role: "member" });
    assert.equal(res.status, 403, action);
  }
  assert.equal((await call(ai, guest, { task: "contribute", roomId: room.id, s: room.s, seat: 0 })).status, 403);
  assert.equal((await getJSON(host.account)).calls, undefined);
  await call(rooms, host, { action: "remove", id: room.id, friendId: guest.profile.id });
  assert.equal((await call(rooms, guest, null, room.id)).status, 403);
  assert.equal((await call(rooms, guest)).body.rooms.length, 0);
});

test("two accounts synchronize human turns and feedback; AI uses host quota and authoritative human context", async () => {
  const host = await user("Round host"), member = await user("Human member"), feedback = await user("Reviewer");
  await connect(host, member); await connect(host, feedback);
  const room = await create(host);
  await invite(host, member, room, "member"); await invite(host, feedback, room, "feedback");
  await call(rooms, member, { action: "accept", id: room.id });
  await call(rooms, feedback, { action: "accept", id: room.id });
  assert.equal((await call(rooms, member, { action: "submit", id: room.id, text: "too early" })).status, 409);
  const first = await call(rooms, host, { action: "ai", id: room.id, task: "contribute" });
  assert.equal(first.status, 200);
  assert.equal(first.body.room.humanTurn, member.profile.id);
  assert.deepEqual((await call(rooms, member, null, room.id)).body.room, first.body.room);
  assert.equal((await call(rooms, host, { action: "ai", id: room.id, task: "synthesize" })).body.code, "human_turn_pending");
  assert.equal((await call(rooms, feedback, { action: "submit", id: room.id, text: "wrong role" })).status, 403);
  const submitted = await Promise.all([
    call(rooms, member, { action: "submit", id: room.id, text: "Human unique recommendation" }),
    call(rooms, member, { action: "skip", id: room.id })
  ]);
  assert.equal(submitted.filter(r => r.status === 200).length, 1);
  await call(rooms, feedback, { action: "feedback", id: room.id, text: "Feedback unique critique" });
  const snapshot = (await call(rooms, host, null, room.id)).body.room;
  assert.equal(snapshot.s.messages.filter(m => m.type === "human").length, 2);
  assert.equal(snapshot.s.messages.find(m => m.contributionKind === "feedback").authorName, "Reviewer");
  const brief = await call(rooms, host, { action: "ai", id: room.id, task: "synthesize" });
  assert.equal(brief.status, 200);
  assert.match(prompts.at(-1), /HUMAN Reviewer \(feedback\): Feedback unique critique/);
  assert.match(prompts.at(-1), /HUMAN Human member \(member\): Human unique recommendation/);
  assert.equal((await getJSON(member.account)).calls, undefined);
  assert.equal((await getJSON(feedback.account)).calls, undefined);
  const account = await getJSON(host.account), day = new Date().toISOString().slice(0, 10);
  assert.equal(account.calls[day], 2);
  assert.equal(account.starts.length, 1);
  assert.ok(account.ids[room.s.id]);
  assert.deepEqual((await call(rooms, member, null, room.id)).body.room.s, brief.body.room.s);
  await call(rooms, host, { action: "ai", id: room.id, task: "contribute" });
  assert.match(prompts.at(-1), /HUMAN Reviewer \(feedback\): Feedback unique critique/);
  assert.match(prompts.at(-1), /HUMAN Human member \(member\): Human unique recommendation/);
  assert.equal((await call(rooms, member, { action: "skip", id: room.id })).status, 200);
  const skipped = (await call(rooms, host, null, room.id)).body.room.s.messages.at(-1);
  assert.equal(skipped.contributionKind, "skip");
  const capped = await call(rooms, host, { action: "ai", id: room.id, task: "contribute" });
  assert.equal(capped.status, 429);
  assert.equal((await getJSON(host.account)).calls[day], 3);
  assert.equal((await call(rooms, host, null, room.id)).body.room.busy, false);
});

test("friend removal/block revokes room access and does not stall turns; host close is read-only", async () => {
  const host = await user("Host"), guest = await user("Member");
  await connect(host, guest);
  const room = await create(host);
  await invite(host, guest, room, "member");
  await call(rooms, guest, { action: "accept", id: room.id });
  await call(rooms, host, { action: "ai", id: room.id, task: "contribute" });
  await call(friends, guest, { action: "block", id: host.profile.id });
  assert.equal((await call(rooms, guest, null, room.id)).status, 403);
  assert.equal((await call(rooms, guest, { action: "submit", id: room.id, text: "revoked" })).status, 403);
  assert.equal((await call(rooms, host, null, room.id)).body.room.humanTurn, null);
  await call(friends, guest, { action: "unblock", id: host.profile.id });
  await connect(host, guest);
  assert.equal((await call(rooms, guest, null, room.id)).status, 403, "reconnecting does not revive revoked invitations");
  assert.equal((await call(rooms, host, { action: "close", id: room.id })).status, 200);
  assert.equal((await call(rooms, host, { action: "ai", id: room.id, task: "synthesize" })).status, 409);
  assert.equal((await call(rooms, host, { action: "host-message", id: room.id, text: "closed" })).status, 409);
});

test("CSRF, role tampering, malformed import and unauthenticated AI fail closed", async () => {
  const host = await user("Protected");
  assert.equal((await call(rooms, host, { action: "create", s: {} })).status, 400);
  assert.equal((await call(rooms, host, { action: "create" }, null, { Origin: "https://evil.test" })).status, 403);
  assert.equal((await call(rooms, host, { action: "create" }, null, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  const room = await create(host);
  assert.equal((await call(ai, host, { roomId: room.id, task: "contribute" })).status, 403,
    "room AI must go through the synchronized room operation");
  assert.equal((await call(rooms, host, { action: "role", id: room.id, role: "host" })).status, 400);
  assert.equal((await call(ai, null, { roomId: room.id, task: "contribute" })).status, 401);
  process.env.REQUIRE_SIGNIN = "0";
  try {
    assert.equal((await call(ai, null, { roomId: room.id, task: "contribute" })).status, 401);
    assert.equal((await call(rooms, host, { action: "ai", id: room.id, task: "contribute" })).status, 200);
    assert.equal((await getJSON(host.account)).starts.length, 1);
  } finally { process.env.REQUIRE_SIGNIN = "1"; }
});

test("an in-flight AI operation cannot overwrite a closed room or leave a stale reservation", async () => {
  const host = await user("Closing host"), guest = await user("Closing viewer");
  await connect(host, guest);
  const room = await create(host);
  await invite(host, guest, room, "viewer");
  await call(rooms, guest, { action: "accept", id: room.id });
  const fakeFetch = globalThis.fetch;
  let release;
  const waiting = new Promise(resolve => { release = resolve; });
  let reached;
  const upstream = new Promise(resolve => { reached = resolve; });
  globalThis.fetch = async () => {
    reached();
    await waiting;
    return new Response('data: {"choices":[{"delta":{"content":"Late AI answer"}}]}\n\n');
  };
  try {
    const pending = call(rooms, host, { action: "ai", id: room.id, task: "contribute" });
    await upstream;
    assert.equal((await call(rooms, host, { action: "ai", id: room.id, task: "contribute" })).body.code, "room_busy");
    await call(rooms, host, { action: "close", id: room.id });
    release();
    assert.equal((await pending).body.code, "room_closed");
    const saved = (await call(rooms, guest, null, room.id)).body.room;
    assert.equal(saved.closed, true);
    assert.equal(saved.busy, false);
    assert.equal(saved.s.messages.length, 1);
    assert.equal((await call(rooms, guest, { action: "feedback", id: room.id, text: "closed" })).status, 409);
  } finally { release(); globalThis.fetch = fakeFetch; }
});

test("host can invite human turns without spending AI allowance", async () => {
  const host = await user("Human round host"), guest = await user("Human round member");
  await connect(host, guest);
  const room = await create(host);
  assert.equal((await call(rooms, host, { action: "human-round", id: room.id })).body.code, "no_human_members");
  await invite(host, guest, room, "member");
  await call(rooms, guest, { action: "accept", id: room.id });
  assert.equal((await call(rooms, guest, { action: "human-round", id: room.id })).status, 403);
  const round = await call(rooms, host, { action: "human-round", id: room.id });
  assert.equal(round.body.room.humanTurn, guest.profile.id);
  assert.equal((await call(rooms, host, { action: "human-round", id: room.id })).status, 409);
  assert.equal((await call(rooms, guest, { action: "submit", id: room.id, text: "Human-first thought" })).status, 200);
  await call(rooms, host, { action: "human-round", id: room.id });
  assert.equal((await call(rooms, guest, { action: "skip", id: room.id })).status, 200);
  assert.equal((await getJSON(host.account)).calls, undefined);
  assert.equal((await getJSON(guest.account)).calls, undefined);
});

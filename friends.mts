import type { Config } from "@netlify/functions";
import { sessionFrom, acctKey, getJSON, sha, randomHex, type Account } from "../lib/auth.mts";
import { getStore, withStoreLock } from "../lib/store.mts";
import { revokeFriendRooms } from "../lib/rooms.mts";
import { revokeFriendShares } from "../lib/shares.mts";

type PeerState = "incoming" | "outgoing" | "friend" | "blocked";
type Peer = { key: string; name: string; state: PeerState };
type Profile = {
  id: string; code: string; name: string; peers: Record<string, Peer>;
  attempts?: { slot: number; count: number };
};
const STORE = "council-friends";
const MAX_CONNECTIONS = 200;
const store = () => getStore({ name: STORE, consistency: "strong" });
const read = async <T>(key: string): Promise<T | null> => (await store().get(key, { type: "json" })) as T | null;
const write = (key: string, value: unknown) => store().setJSON(key, value);
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Cookie" }
});
class FriendError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) {
    super(message); this.code = code; this.status = status;
  }
}
const fail = (code: string, status: number, message: string): never => { throw new FriendError(code, status, message); };

function view(profile: Profile) {
  const result = {
    profile: { id: profile.id, name: profile.name, code: profile.code },
    friends: [] as { id: string; name: string }[],
    incoming: [] as { id: string; name: string }[],
    outgoing: [] as { id: string; name: string }[],
    blocked: [] as { id: string; name: string }[]
  };
  for (const [id, peer] of Object.entries(profile.peers)) {
    const list = peer.state === "friend" ? result.friends : result[peer.state];
    list.push({ id, name: peer.name });
  }
  for (const list of [result.friends, result.incoming, result.outgoing, result.blocked])
    list.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return result;
}

async function profileFor(email: string) {
  const key = "profile/" + await sha(email);
  const account = await getJSON<Account>(await acctKey(email));
  if (!account?.passwordHash) fail("signin_required", 401, "Sign in with your Council account to use friends.");
  let profile = await read<Profile>(key);
  if (!profile) {
    let code = randomHex(6).toUpperCase();
    while (await read("code/" + code)) code = randomHex(6).toUpperCase();
    profile = { id: randomHex(16), code, name: account.name || "Council member", peers: {} };
    await write(key, profile);
    await write("code/" + code, key);
  } else if (profile.name !== account.name && account.name) {
    profile.name = account.name;
    await write(key, profile);
  }
  return { key, profile };
}

function requestBudget(profile: Profile) {
  // Persist failed lookups too: friend-code guessing must not be unlimited.
  const slot = Math.floor(Date.now() / (15 * 60 * 1000));
  const attempts = profile.attempts?.slot === slot ? profile.attempts : { slot, count: 0 };
  if (attempts.count >= 20) fail("rate_limited", 429, "Too many friend requests. Please try again in 15 minutes.");
  attempts.count++;
  profile.attempts = attempts;
}

export default async function handle(req: Request) {
  if (req.method !== "GET" && req.method !== "POST") return json({ code: "invalid_request" }, 405);
  let body: any = {};
  if (req.method === "POST") {
    const origin = req.headers.get("origin");
    try {
      if ((origin && new URL(origin).host !== new URL(req.url).host) || req.headers.get("sec-fetch-site") === "cross-site")
        return json({ code: "invalid_request", message: "Cross-site requests are not allowed." }, 403);
    } catch { return json({ code: "invalid_request" }, 403); }
    if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ code: "invalid_request" }, 400);
    const raw = await req.text();
    if (raw.length > 2048) return json({ code: "invalid_request" }, 413);
    try { body = JSON.parse(raw); } catch { return json({ code: "invalid_request" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ code: "invalid_request" }, 400);
    if (!["request", "accept", "decline", "cancel", "remove", "block", "unblock"].includes(body.action))
      return json({ code: "invalid_request" }, 400);
  }
  try {
    // Both sides and the code index use one transaction / cross-instance lock.
    // Return expected errors instead of throwing after budgeting, so failed
    // lookups commit their throttle counter in PostgreSQL as well.
    return await withStoreLock(STORE, "writes", async () => {
      const session = await sessionFrom(req);
      if (!session) return json({ code: "signin_required", message: "Sign in to use friends." }, 401);
      const { key, profile } = await profileFor(session.email);
      if (req.method === "GET") return json(view(profile));
      let targetKey: string;
      if (body.action === "request") {
        try { requestBudget(profile); } catch (error) {
          if (error instanceof FriendError) return json({ code: error.code, message: error.message }, error.status);
          throw error;
        }
        await write(key, profile);
        const code = typeof body.code === "string" ? body.code.replace(/[-\s]/g, "").toUpperCase() : "";
        if (!/^[A-F0-9]{12}$/.test(code)) return json({ code: "invalid_code", message: "Enter a valid friend code." }, 400);
        targetKey = await read<string>("code/" + code) || "";
        if (!targetKey) return json({ code: "friend_not_available", message: "This friend code is not available." }, 404);
      } else {
        if (typeof body.id !== "string" || !/^[a-f0-9]{32}$/.test(body.id))
          return json({ code: "invalid_request" }, 400);
        const relation = profile.peers[body.id];
        if (!relation) return json({ code: "not_pending", message: "This connection is no longer available. Refresh your list." }, 409);
        targetKey = relation.key;
      }
      const target = await read<Profile>(targetKey);
      if (!target) return json({ code: "friend_not_available", message: "This connection is not available." }, 404);
      if (target.id === profile.id) return json({ code: "self_request", message: "You cannot add yourself." }, 400);
      const mine = profile.peers[target.id], theirs = target.peers[profile.id];
      const put = (state: PeerState, reverse: PeerState) => {
        profile.peers[target.id] = { key: targetKey, name: target.name, state };
        target.peers[profile.id] = { key, name: profile.name, state: reverse };
      };
      const clear = () => {
        delete profile.peers[target.id];
        if (theirs?.state !== "blocked") delete target.peers[profile.id];
      };
      switch (body.action) {
        case "request":
          if (mine?.state === "blocked" || theirs?.state === "blocked")
            return json({ code: "friend_not_available", message: "This friend code is not available." }, 404);
          if (mine?.state === "friend") return json({ code: "already_friends", message: "You are already friends." }, 409);
          if (mine?.state === "outgoing") return json({ code: "request_exists", message: "Your request is already pending." }, 409);
          if (mine?.state === "incoming") return json({ code: "request_received", message: "They have already sent you a request. Accept it in incoming requests." }, 409);
          if (Object.keys(profile.peers).length >= MAX_CONNECTIONS || Object.keys(target.peers).length >= MAX_CONNECTIONS)
            return json({ code: "limit_reached", message: "The connection limit has been reached." }, 409);
          put("outgoing", "incoming");
          break;
        case "accept":
          if (mine?.state !== "incoming" || theirs?.state !== "outgoing")
            return json({ code: "not_pending", message: "This request is no longer pending." }, 409);
          put("friend", "friend");
          break;
        case "decline":
        case "cancel":
          if (mine?.state !== (body.action === "decline" ? "incoming" : "outgoing"))
            return json({ code: "not_pending", message: "This request is no longer pending." }, 409);
          clear();
          break;
        case "remove":
          if (mine?.state !== "friend") return json({ code: "not_friend", message: "This person is not on your friends list." }, 409);
          clear();
          break;
        case "block":
          if (mine?.state === "blocked") return json(view(profile));
          clear();
          profile.peers[target.id] = { key: targetKey, name: target.name, state: "blocked" };
          break;
        case "unblock":
          if (mine?.state !== "blocked") return json({ code: "not_pending", message: "This person is not blocked." }, 409);
          clear();
          break;
      }
      await write(key, profile);
      await write(targetKey, target);
      if (body.action === "remove" || body.action === "block") {
        await revokeFriendRooms(key, targetKey);
        await revokeFriendShares(key, targetKey);
      }
      return json(view(profile));
    });
  } catch (error) {
    if (error instanceof FriendError) return json({ code: error.code, message: error.message }, error.status);
    console.error("[friends] Connection storage could not be updated.");
    return json({ code: "server_error", message: "Friends could not be saved. Please try again." }, 503);
  }
}
export const config: Config = { path: "/api/friends" };

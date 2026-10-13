import { randomHex } from "./auth.mts";
import { getStore } from "./store.mts";
import { identity, friendship, RoomError } from "./rooms.mts";

type Entry = { author: string; text: string; demo: boolean };
export type Snapshot = { kind: "full" | "insights" | "brief"; question: string; context?: string; entries?: Entry[]; brief?: string; demo: boolean };
type Grant = { id: string; key: string; name: string };
export type Share = {
  id: string; ownerKey: string; ownerId: string; ownerName: string; createdAt: number;
  snapshot: Snapshot; grants: Grant[];
};
export const sharesStore = () => getStore({ name: "council-shares", consistency: "strong" });
const fail = (code: string, status = 400): never => { throw new RoomError(code, status); };
function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) fail("invalid_request");
  return value as string;
}
// Reconstruct only opted-in display content. Never persist arbitrary browser
// session fields, custom prompts, account metadata, preferences or drafts.
export function cleanSnapshot(input: any): Snapshot {
  if (!input || !["full", "insights", "brief"].includes(input.kind)) fail("invalid_request");
  const result: Snapshot = { kind: input.kind, question: text(input.question, 2000, true), demo: input.demo === true };
  if (input.kind === "full") result.context = text(input.context ?? "", 10000);
  if (input.kind !== "brief") {
    if (!Array.isArray(input.entries) || input.entries.length > 600 || (input.kind === "insights" && !input.entries.length))
      fail("invalid_request");
    result.entries = input.entries.map((entry: any) => {
      if (!entry || typeof entry !== "object") fail("invalid_request");
      return { author: text(entry.author, 160, true), text: text(entry.text, 16000), demo: entry.demo === true };
    });
  }
  if (input.kind !== "insights") result.brief = text(input.brief ?? "", 24000, input.kind === "brief");
  if (JSON.stringify(result).length > 380000) fail("invalid_request", 413);
  return result;
}
export async function readShare(id: string): Promise<Share | null> {
  if (typeof id !== "string" || !/^[a-f0-9]{32}$/.test(id)) fail("invalid_request");
  return await sharesStore().get("share/" + id, { type: "json" }) as Share | null;
}
export async function shareAccess(req: Request, id: string) {
  const who = await identity(req);
  const share = await readShare(id);
  if (!share) fail("share_unavailable", 404);
  const owner = share!.ownerKey === who.key;
  if (!owner) {
    const grant = share!.grants.find(g => g.key === who.key && g.id === who.profile.id);
    if (!grant || !await friendship(share!.ownerKey, who.key, share!.ownerId, who.profile.id))
      fail("share_unavailable", 403);
  }
  return { share: share!, who, owner };
}
export function shareView(share: Share, owner: boolean) {
  return {
    share: { id: share.id, ownerId: share.ownerId, ownerName: share.ownerName,
      createdAt: share.createdAt, snapshot: share.snapshot },
    owner,
    ...(owner ? { grants: share.grants.map(({ id, name }) => ({ id, name })) } : {})
  };
}
export async function grantsFor(who: any, ids: unknown): Promise<Grant[]> {
  if (!Array.isArray(ids) || !ids.length || ids.length > 20 || new Set(ids).size !== ids.length) fail("invalid_request");
  const grants: Grant[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || !/^[a-f0-9]{32}$/.test(id)) fail("invalid_request");
    const peer = who.profile.peers[id];
    if (peer?.state !== "friend" || !await friendship(who.key, peer.key, who.profile.id, id)) fail("not_friend", 403);
    grants.push({ id, key: peer.key, name: peer.name });
  }
  return grants;
}
export async function shareIndex(key: string): Promise<string[]> {
  return await sharesStore().get("index/" + key, { type: "json" }) as string[] || [];
}
export async function indexShare(key: string, id: string) {
  const ids = await shareIndex(key);
  if (ids.includes(id)) return;
  if (ids.length >= 200) fail("share_limit", 409);
  await sharesStore().setJSON("index/" + key, [...ids, id]);
}
export async function requireIndexCapacity(keys: string[], id?: string) {
  // Preflight expected quota failures before any write, including on Netlify
  // where the shared lock serializes writes but is not a rollback transaction.
  for (const key of keys) {
    const ids = await shareIndex(key);
    if (ids.length >= 200 && (!id || !ids.includes(id))) fail("share_limit", 409);
  }
}
export async function unindexShare(key: string, id: string) {
  await sharesStore().setJSON("index/" + key, (await shareIndex(key)).filter(x => x !== id));
}
export async function createShare(who: any, snapshot: Snapshot, grants: Grant[]) {
  const share: Share = { id: randomHex(16), ownerKey: who.key, ownerId: who.profile.id,
    ownerName: who.profile.name, createdAt: Date.now(), snapshot, grants };
  await requireIndexCapacity([who.key, ...grants.map(g => g.key)]);
  await indexShare(who.key, share.id);
  for (const grant of grants) await indexShare(grant.key, share.id);
  await sharesStore().setJSON("share/" + share.id, share);
  return share;
}
// Called inside the friends lock so re-friending never restores old consent.
export async function revokeFriendShares(firstKey: string, secondKey: string) {
  for (const id of await shareIndex(firstKey)) {
    const share = await readShare(id);
    if (!share || ![firstKey, secondKey].includes(share.ownerKey)) continue;
    const guestKey = share.ownerKey === firstKey ? secondKey : firstKey;
    if (!share.grants.some(g => g.key === guestKey)) continue;
    share.grants = share.grants.filter(g => g.key !== guestKey);
    await sharesStore().setJSON("share/" + id, share);
    await unindexShare(guestKey, id);
  }
}

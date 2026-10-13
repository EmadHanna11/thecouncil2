import type { Config } from "@netlify/functions";
import { roomLock, identity, RoomError } from "../lib/rooms.mts";
import {
  sharesStore, shareAccess, shareView, shareIndex, indexShare, unindexShare,
  cleanSnapshot, grantsFor, createShare, requireIndexCapacity
} from "../lib/shares.mts";

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Cookie" }
});
export default async function handle(req: Request) {
  if (!["GET", "POST"].includes(req.method)) return json({ code: "invalid_request" }, 405);
  let body: any;
  if (req.method === "POST") {
    try {
      const origin = req.headers.get("origin");
      if ((origin && new URL(origin).host !== new URL(req.url).host) || req.headers.get("sec-fetch-site") === "cross-site")
        return json({ code: "invalid_request" }, 403);
      if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ code: "invalid_request" }, 400);
      const raw = await req.text();
      if (raw.length > 400000) return json({ code: "invalid_request" }, 413);
      body = JSON.parse(raw);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
      if (!["create", "grant", "revoke", "delete"].includes(body.action)) throw new Error();
    } catch { return json({ code: "invalid_request" }, 400); }
  }
  try {
    // Reads and writes serialize with friendship revocation in both runtimes.
    return await roomLock(async () => {
      if (req.method === "GET") {
        const id = new URL(req.url).searchParams.get("id");
        if (id) { const { share, owner } = await shareAccess(req, id); return json(shareView(share, owner)); }
        const who = await identity(req);
        const owned = [], received = [];
        for (const id of await shareIndex(who.key)) {
          try {
            const { share, owner } = await shareAccess(req, id);
            const summary = { id, ownerName: share.ownerName, createdAt: share.createdAt,
              kind: share.snapshot.kind, question: share.snapshot.question,
              ...(owner ? { recipients: share.grants.length } : {}) };
            (owner ? owned : received).push(summary);
          } catch (error) {
            if (!(error instanceof RoomError) || !["share_unavailable"].includes(error.code)) throw error;
          }
        }
        return json({ owned: owned.reverse(), received: received.reverse() });
      }
      if (body.action === "create") {
        const who = await identity(req);
        const snapshot = cleanSnapshot(body.snapshot);
        const grants = await grantsFor(who, body.friendIds);
        return json(shareView(await createShare(who, snapshot, grants), true));
      }
      const { share, who, owner } = await shareAccess(req, body.id);
      if (!owner) throw new RoomError("owner_only", 403);
      if (body.action === "delete") {
        // Unindex and delete only this opted-in server copy, never local history.
        for (const grant of share.grants) await unindexShare(grant.key, share.id);
        await unindexShare(share.ownerKey, share.id);
        await sharesStore().delete("share/" + share.id);
        return json({ ok: true });
      }
      if (body.action === "grant") {
        const grants = await grantsFor(who, body.friendIds);
        const newGrants = grants.filter(g => !share.grants.some(old => old.id === g.id));
        if (share.grants.length + newGrants.length > 20) throw new RoomError("share_limit", 409);
        await requireIndexCapacity(newGrants.map(g => g.key), share.id);
        for (const grant of newGrants) await indexShare(grant.key, share.id);
        share.grants.push(...newGrants);
      } else {
        if (typeof body.friendId !== "string" || !/^[a-f0-9]{32}$/.test(body.friendId)) throw new RoomError("invalid_request");
        const grant = share.grants.find(g => g.id === body.friendId);
        share.grants = share.grants.filter(g => g.id !== body.friendId);
        if (grant) await unindexShare(grant.key, share.id);
      }
      await sharesStore().setJSON("share/" + share.id, share);
      return json(shareView(share, true));
    });
  } catch (error) {
    if (error instanceof RoomError) return json({ code: error.code }, error.status);
    console.error("[shares] Shared content storage failed.");
    return json({ code: "storage_unavailable" }, 503);
  }
}
export const config: Config = { path: "/api/shares" };

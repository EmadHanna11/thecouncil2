import type { Config, Context } from "@netlify/functions";
import { randomHex } from "../lib/auth.mts";
import {
  RoomError, roomsStore, roomLock, identity, access, hostRoom, publicRoom, saveRoom,
  indexRoom, nextHuman, addHuman, friendship, readRoom, type Room
} from "../lib/rooms.mts";
import { cleanSession } from "./ai.mts";
import { BY_ID } from "../lib/prompts.mjs";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Cookie" }
});
const errorResponse = (error: unknown) => error instanceof RoomError
  ? json({ code: error.code }, error.status)
  : (console.error("[rooms] Room storage or AI request failed."), json({ code: "storage_unavailable" }, 503));
const requireOpen = (room: Room) => { if (room.closed) throw new RoomError("room_closed", 409); };
const requireIdle = (room: Room) => {
  if (room.busy && room.busy.at > Date.now() - 180000) throw new RoomError("room_busy", 409);
  room.busy = null;
};

export default async function handle(req: Request, context: Context) {
  if (!["GET", "POST"].includes(req.method)) return json({ code: "invalid_request" }, 405);
  let body: any = {};
  if (req.method === "POST") {
    try {
      const origin = req.headers.get("origin");
      if ((origin && new URL(origin).host !== new URL(req.url).host) || req.headers.get("sec-fetch-site") === "cross-site")
        return json({ code: "invalid_request" }, 403);
      if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ code: "invalid_request" }, 400);
      const raw = await req.text();
      if (raw.length > 400000) return json({ code: "prompt_too_large" }, 413);
      body = JSON.parse(raw);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    } catch { return json({ code: "invalid_request" }, 400); }
  }
  try {
    if (req.method === "GET") {
      return await roomLock(async () => {
        const id = new URL(req.url).searchParams.get("id");
        if (id) {
          const { room, who, role } = await access(req, id);
          let changed = false;
          if (room.busy && room.busy.at <= Date.now() - 180000) { room.busy = null; changed = true; }
          if (room.humanTurn && !await activeTurn(room)) { await nextHuman(room); changed = true; }
          if (changed) await saveRoom(room);
          return json(publicRoom(room, who, role));
        }
        const who = await identity(req);
        const ids = await roomsStore().get("index/" + who.key, { type: "json" }) as string[] || [];
        const summaries = [];
        for (const id of ids) {
          try {
            const { room, role } = await access(req, id, true);
            const p = room.participants.find(p => p.key === who.key);
            if (room.closed && p?.status === "pending") continue;
            summaries.push({ id, hostName: room.hostName, role, status: role === "host" ? "accepted" : p!.status,
              closed: room.closed, question: room.s.question, ...(role === "host" ? { discussionId: room.s.id } : {}),
              history: { messages: room.s.messages.length, hasBrief: !!room.s.synthesis, includesContext: true } });
          } catch (error) { if (!(error instanceof RoomError)) throw error; }
        }
        return json({ rooms: summaries.reverse() });
      });
    }
    if (body.action === "ai") return await runAI(req, context, body);
    return await roomLock(async () => {
      if (body.action === "create") {
        const who = await identity(req);
        let s: any;
        try { s = cleanSession(body.s); } catch { throw new RoomError("invalid_request"); }
        if (s.seats.some((pid: string) => !BY_ID.has(pid) && !s.customs.some((c: any) => c.id === pid && c.name)))
          throw new RoomError("invalid_request");
        if (!s.question.trim() || typeof body.s.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(body.s.id))
          throw new RoomError("invalid_request");
        // Only explicit discussion content is imported. Browser preferences,
        // drafts and account metadata are never shared.
        s.id = body.s.id;
        s.turn = s.messages.filter((m: any) => m.type === "persona").length;
        s.synthesis = typeof body.s.synthesis === "string" ? body.s.synthesis.slice(0, 16000) : "";
        s.synthDemo = !!body.s.synthDemo || !!body.s.example;
        if (body.s.example) for (const message of s.messages) {
          if (message.type === "persona") message.demo = true;
        }
        // Explicit invitation flow reuses a host's open table atomically. Never
        // silently overwrite its shared history with a later browser copy.
        if (body.reuse === true) {
          const ids = await roomsStore().get("index/" + who.key, { type: "json" }) as string[] || [];
          for (const id of [...ids].reverse()) {
            const previous = await readRoom(id);
            if (previous && previous.hostKey === who.key && !previous.closed && previous.s.id === s.id)
              return json(publicRoom(previous, who, "host"));
          }
        }
        const room: Room = { id: randomHex(16), hostId: who.profile.id, hostKey: who.key, hostName: who.profile.name,
          version: 1, closed: false, s, participants: [], humanTurn: null, humanQueue: [], busy: null };
        await indexRoom(who.key, room.id);
        await roomsStore().setJSON("room/" + room.id, room);
        return json(publicRoom(room, who, "host"));
      }
      const { room, who, role } = await access(req, body.id, ["accept", "decline"].includes(body.action));
      requireOpen(room);
      const person = room.participants.find(p => p.key === who.key);
      if (["accept", "decline"].includes(body.action)) {
        if (!person || person.status !== "pending") throw new RoomError("not_pending", 409);
        person.status = body.action === "accept" ? "accepted" : "declined";
        await saveRoom(room);
        return body.action === "accept" ? json(publicRoom(room, who, role)) : json({ ok: true });
      }
      if (["invite", "remove", "close", "host-message", "human-round"].includes(body.action)) {
        if (role !== "host") throw new RoomError("host_only", 403);
        if (body.action === "close") { room.closed = true; room.humanTurn = null; room.humanQueue = []; room.busy = null; }
        if (body.action === "invite") {
          if (!["viewer", "feedback", "member"].includes(body.role)) throw new RoomError("invalid_request");
          const peer = who.profile.peers[body.friendId];
          if (peer?.state !== "friend" || !await friendship(who.key, peer.key, who.profile.id, body.friendId))
            throw new RoomError("not_friend", 403);
          if (room.participants.some(p => p.id === body.friendId && ["pending", "accepted"].includes(p.status)))
            throw new RoomError("already_invited", 409);
          if (room.participants.length >= 20) throw new RoomError("room_limit", 409);
          await indexRoom(peer.key, room.id);
          room.participants = room.participants.filter(p => p.id !== body.friendId);
          room.participants.push({ id: body.friendId, key: peer.key, name: peer.name, role: body.role, status: "pending" });
        }
        if (body.action === "remove") {
          const target = room.participants.find(p => p.id === body.friendId);
          if (!target) throw new RoomError("room_unavailable", 404);
          target.status = "revoked";
          room.humanQueue = room.humanQueue.filter(id => id !== target.id);
          if (room.humanTurn === target.id) await nextHuman(room);
        }
        if (body.action === "host-message") {
          requireIdle(room);
          addHuman(room, who, "host", validText(body.text));
        }
        if (body.action === "human-round") {
          requireIdle(room);
          if (room.humanTurn) throw new RoomError("human_turn_pending", 409);
          room.humanQueue = room.participants.filter(p => p.role === "member" && p.status === "accepted").map(p => p.id);
          await nextHuman(room);
          if (!room.humanTurn) throw new RoomError("no_human_members", 409);
        }
      } else if (body.action === "feedback") {
        if (role !== "feedback") throw new RoomError("role_forbidden", 403);
        requireIdle(room);
        addHuman(room, who, "feedback", validText(body.text));
      } else if (["submit", "skip"].includes(body.action)) {
        if (role !== "member") throw new RoomError("role_forbidden", 403);
        requireIdle(room);
        if (room.humanTurn && !await activeTurn(room)) await nextHuman(room);
        if (room.humanTurn !== who.profile.id) throw new RoomError("not_your_turn", 409);
        addHuman(room, who, body.action === "skip" ? "skip" : "member", body.action === "skip" ? "" : validText(body.text));
        await nextHuman(room);
      } else throw new RoomError("invalid_request");
      await saveRoom(room);
      return json(publicRoom(room, who, role));
    });
  } catch (error) { return errorResponse(error); }
}

function validText(text: unknown) {
  if (typeof text !== "string" || !text.trim() || text.length > 6000) throw new RoomError("invalid_text");
  return text.trim();
}
async function activeTurn(room: Room) {
  const p = room.participants.find(p => p.id === room.humanTurn && p.status === "accepted");
  return p && await friendship(room.hostKey, p.key, room.hostId, p.id);
}
async function runAI(req: Request, context: Context, body: any) {
  if (!["contribute", "synthesize"].includes(body.task)) throw new RoomError("invalid_request");
  const token = randomHex(16);
  const initial = await roomLock(async () => {
    const room = await hostRoom(req, body.id);
    requireIdle(room);
    if (room.humanTurn && !await activeTurn(room)) await nextHuman(room);
    if (room.humanTurn) throw new RoomError("human_turn_pending", 409);
    if (room.s.messages.length >= 600) throw new RoomError("room_limit", 409);
    room.busy = { token, at: Date.now() };
    await saveRoom(room);
    return room;
  });
  try {
    const { default: ai } = await import("./ai.mts");
    const response = await ai(new Request(new URL("/api/ai", req.url), {
      method: "POST", signal: req.signal, headers: {
        Cookie: req.headers.get("cookie") || "", Origin: new URL(req.url).origin,
        "Content-Type": "application/json", "X-Council-Discussion": initial.s.id
      }, body: JSON.stringify({ task: body.task, roomId: body.id, roomToken: token, seat: initial.s.turn % initial.s.seats.length })
    }), context);
    if (!response.ok) return response;
    const text = await response.text();
    if (!text.trim() || req.signal.aborted) throw new RoomError("upstream_error", 502);
    return await roomLock(async () => {
      const { room, who, role } = await access(req, body.id);
      requireOpen(room);
      if (room.busy?.token !== token) throw new RoomError("room_changed", 409);
      if (body.task === "synthesize") { room.s.synthesis = text.slice(0, 16000); room.s.synthDemo = false; }
      else {
        const seat = room.s.turn % room.s.seats.length;
        room.s.messages.push({ id: randomHex(16), type: "persona", pid: room.s.seats[seat], text: text.slice(0, 6000),
          round: Math.floor(room.s.turn / room.s.seats.length) + 1, demo: false });
        room.s.turn++;
        room.s.synthesis = "";
        // Every completed AI round is followed by each accepted human member.
        if (room.s.turn % room.s.seats.length === 0) {
          room.humanQueue = room.participants.filter(p => p.role === "member" && p.status === "accepted").map(p => p.id);
          await nextHuman(room);
        }
      }
      room.busy = null;
      await saveRoom(room);
      return json(publicRoom(room, who, role));
    });
  } finally {
    await roomLock(async () => {
      // Cleanup belongs to this operation even if the host signs out while
      // the upstream stream is running. Never leave a stale busy reservation.
      const room = await readRoom(body.id);
      if (room?.busy?.token === token) { room.busy = null; await saveRoom(room); }
    });
  }
}
export const config: Config = { path: "/api/rooms" };

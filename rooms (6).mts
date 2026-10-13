import { sessionFrom, sha, randomHex } from "./auth.mts";
import { getStore, withStoreLock } from "./store.mts";

export type Role = "viewer" | "feedback" | "member" | "host";
type Participant = { id: string; key: string; name: string; role: Role; status: "pending" | "accepted" | "revoked" | "declined" };
export type Room = {
  id: string; hostId: string; hostKey: string; hostName: string;
  version: number; closed: boolean; s: any; participants: Participant[];
  humanTurn: string | null; humanQueue: string[]; busy: { token: string; at: number } | null;
};
export class RoomError extends Error {
  code: string;
  status: number;
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status; }
}
export const roomsStore = () => getStore({ name: "council-rooms", consistency: "strong" });
export const roomLock = <T>(fn: () => Promise<T>) => withStoreLock("council-friends", "writes", fn);
export const readRoom = async (id: string): Promise<Room | null> => {
  if (!/^[a-f0-9]{32}$/.test(id || "")) throw new RoomError("invalid_request");
  return await roomsStore().get("room/" + id, { type: "json" }) as Room | null;
};
export async function identity(req: Request) {
  const session = await sessionFrom(req);
  if (!session) throw new RoomError("signin_required", 401);
  const key = "profile/" + await sha(session.email);
  const profile: any = await getStore("council-friends").get(key, { type: "json" });
  if (!profile) throw new RoomError("friends_required", 409);
  return { key, profile };
}
export async function friendship(hostKey: string, guestKey: string, hostId: string, guestId: string) {
  const friends = getStore("council-friends");
  const host: any = await friends.get(hostKey, { type: "json" });
  const guest: any = await friends.get(guestKey, { type: "json" });
  return host?.peers?.[guestId]?.state === "friend" && guest?.peers?.[hostId]?.state === "friend";
}
export async function access(req: Request, id: string, pending = false) {
  const who = await identity(req);
  const room = await readRoom(id);
  if (!room) throw new RoomError("room_unavailable", 404);
  if (who.key === room.hostKey) return { room, who, role: "host" as Role };
  const participant = room.participants.find(p => p.key === who.key);
  if (!participant || !(participant.status === "accepted" || pending && participant.status === "pending") ||
      !await friendship(room.hostKey, who.key, room.hostId, who.profile.id))
    throw new RoomError("room_unavailable", 403);
  return { room, who, role: participant.role };
}
export async function hostRoom(req: Request, id: string) {
  const data = await access(req, id);
  if (data.role !== "host") throw new RoomError("host_only", 403);
  if (data.room.closed) throw new RoomError("room_closed", 409);
  return data.room;
}
export function publicRoom(room: Room, who: any, role: Role) {
  return {
    room: { id: room.id, hostId: room.hostId, hostName: room.hostName, closed: room.closed,
      version: room.version, s: room.s, humanTurn: room.humanTurn, busy: !!room.busy,
      participants: room.participants.filter(p => !["revoked", "declined"].includes(p.status))
        .map(({ id, name, role, status }) => ({ id, name, role, status })) },
    me: { id: who.profile.id, role }
  };
}
export async function saveRoom(room: Room) {
  room.version++;
  await roomsStore().setJSON("room/" + room.id, room);
}
export async function indexRoom(key: string, id: string) {
  const indexKey = "index/" + key;
  const ids = await roomsStore().get(indexKey, { type: "json" }) as string[] || [];
  if (ids.includes(id)) return;
  if (ids.length >= 100) throw new RoomError("room_limit", 409);
  await roomsStore().setJSON(indexKey, [...ids, id]);
}
export async function nextHuman(room: Room) {
  room.humanTurn = null;
  while (room.humanQueue.length) {
    const id = room.humanQueue.shift()!;
    const person = room.participants.find(p => p.id === id && p.status === "accepted" && p.role === "member");
    if (person && await friendship(room.hostKey, person.key, room.hostId, id)) {
      room.humanTurn = id; break;
    }
  }
}
export function addHuman(room: Room, who: any, kind: string, text = "") {
  if (room.s.messages.length >= 600) throw new RoomError("room_limit", 409);
  room.s.messages.push({ id: randomHex(16), type: "human", authorId: who.profile.id,
    authorName: who.profile.name, contributionKind: kind, text, round: Math.floor(room.s.turn / room.s.seats.length) + 1 });
  room.s.synthesis = "";
}

// Removing a friendship or blocking must permanently invalidate its room
// invitations, not silently restore access if the two accounts reconnect.
// Called within the existing friends transaction, without a nested lock.
export async function revokeFriendRooms(firstKey: string, secondKey: string) {
  const ids = await roomsStore().get("index/" + firstKey, { type: "json" }) as string[] || [];
  for (const id of ids) {
    const room = await readRoom(id);
    if (!room || ![firstKey, secondKey].includes(room.hostKey)) continue;
    const guestKey = room.hostKey === firstKey ? secondKey : firstKey;
    const guest = room.participants.find(p => p.key === guestKey && ["accepted", "pending"].includes(p.status));
    if (!guest) continue;
    guest.status = "revoked";
    room.humanQueue = room.humanQueue.filter(id => id !== guest.id);
    if (room.humanTurn === guest.id) await nextHuman(room);
    await saveRoom(room);
  }
}

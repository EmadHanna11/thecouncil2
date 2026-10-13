import { getStore, setJSONIfAbsent as atomicSetJSONIfAbsent, incrementJSONIfBelow as atomicIncrementJSONIfBelow } from "./store.mts";

// Password accounts + daily discussion quota. No email-delivery service.

export const DAY = 24 * 60 * 60 * 1000;
export const authEnabled = () => Netlify.env.get("REQUIRE_SIGNIN") !== "0";
export const dailyLimit = () => Math.max(1, Number(Netlify.env.get("DISCUSSIONS_PER_DAY") || 2));
const store = () => getStore({ name: "council-auth", consistency: "strong" });

export async function sha(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}
export const randomHex = (bytes: number) => [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2, "0")).join("");
export const normEmail = (e: unknown) => String(e || "").trim().toLowerCase();
export const validEmail = (e: string) => e.length <= 254 && /^[^\s@<>()]{1,64}@[^\s@<>()]{1,190}\.[a-z]{2,24}$/i.test(e);

export async function getJSON<T = any>(k: string): Promise<T | null> { return ((await store().get(k, { type: "json" })) as T) ?? null; }
export async function setJSON(k: string, v: unknown) { await store().setJSON(k, v); }
export async function setJSONIfAbsent(k: string, v: unknown) {
  return atomicSetJSONIfAbsent("council-auth", k, v);
}
export async function incrementJSONIfBelow(k: string, limit: number) {
  return atomicIncrementJSONIfBelow("council-auth", k, limit);
}
export async function del(k: string) { await store().delete(k); }

export type Account = { email: string; name?: string; passwordHash?: string; starts: number[]; ids: Record<string, number>; calls?: Record<string, number>; created?: number; recoveryHashes?: string[]; authVersion?: number };
export const acctKey = async (email: string) => "acct/" + await sha(email);
// Premium grants are server-managed, never accepted from signup or browser data.
export function isPremiumAccount(acct: Account | null) {
  if (!acct?.email || !acct.passwordHash) return false;
  const grants = (Netlify.env.get("PREMIUM_ACCOUNT_EMAILS") || "").split(/[,;\n]/).map(normEmail).filter(Boolean);
  return grants.includes(normEmail(acct.email));
}

export async function sessionFrom(req: Request) {
  const tok = (req.headers.get("cookie") || "").split(/;\s*/).find(x => x.startsWith(SESSION_COOKIE + "="))?.slice(SESSION_COOKIE.length + 1) || "";
  if (!/^[a-f0-9]{64}$/.test(tok)) return null;
  const key = "sess/" + await sha(tok);
  const s = await getJSON<{ email: string; exp: number; kind?: string; authVersion?: number }>(key);
  if (!s || s.kind !== "password" || !Number.isFinite(s.exp) || s.exp < Date.now()) return null;
  const acct = await getJSON<Account>(await acctKey(s.email));
  if (!acct?.passwordHash || (s.authVersion ?? 0) !== (acct.authVersion ?? 0)) return null;
  return { email: s.email, key };
}
export const SESSION_COOKIE = "council_session";

export function quota(acct: Account | null) {
  const now = Date.now(); const unlimited = isPremiumAccount(acct);
  // Keep numeric wire values JSON-safe; enforcement uses the explicit flag,
  // not this display sentinel. Infinity would serialize to null.
  const limit = unlimited ? Number.MAX_SAFE_INTEGER : dailyLimit();
  const starts = (acct?.starts || []).filter(t => t > now - DAY).sort((a, b) => a - b);
  const used = starts.length;
  // the slot that frees up next: the oldest start that is keeping you at the limit
  const resetAt = unlimited ? null : used >= limit ? starts[used - limit] + DAY : (used ? starts[0] + DAY : null);
  return { used, limit, left: unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, limit - used), resetAt, starts, unlimited };
}

// ---- Admin (owner) access: SITE_PASSKEY unlocks unlimited use in this browser via /admin ----
export const ADMIN_COOKIE = "council_admin";
async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}
export const adminPass = () => Netlify.env.get("SITE_PASSKEY") || "";
export async function adminToken() { const p = adminPass(); return p ? hmacHex(p, "council-admin-v1") : ""; }
export function sameStr(a: string, b: string) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
export async function isAdmin(req: Request) {
  const tok = await adminToken(); if (!tok) return false;
  const c = (req.headers.get("cookie") || "").split(/;\s*/).map(x => x.split("=")).find(([k]) => k === ADMIN_COOKIE)?.[1] || "";
  return !!c && sameStr(c, tok);
}
export async function checkAdminKey(key: string) { const p = adminPass(); if (!p || !key) return false; return sameStr(await hmacHex(p, key), await hmacHex(p, p)); }

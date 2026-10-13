import type { Context, Config } from "@netlify/functions";
import { isAdmin, authEnabled, sha, randomHex, normEmail, validEmail, getJSON, setJSON, setJSONIfAbsent, incrementJSONIfBelow, del, sessionFrom, quota, acctKey, DAY, SESSION_COOKIE, type Account } from "../lib/auth.mts";
import { hashPassword, validPassword, verifyPassword } from "../lib/passwords.mts";
import { withStoreLock } from "../lib/store.mts";

const json = (value: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
const SESSION_TTL = 30 * DAY;

function cookie(req: Request, token: string, maxAge: number) {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(req.url).hostname);
  // Partitioned HTTPS cookies also work when the app is embedded in preview.
  // Cross-site writes are separately rejected by Origin/Sec-Fetch-Site checks.
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${maxAge}${local ? "; SameSite=Lax" : "; SameSite=None; Secure; Partitioned"}`;
}
function publicAccount(acct: Account) {
  const q = quota(acct);
  return { enabled: true, signedIn: true, name: acct.name || "Council member", email: acct.email, plan: q.unlimited ? "premium" : "standard", premium: q.unlimited, unlimited: q.unlimited, used: q.used, limit: q.limit, left: q.left, resetAt: q.resetAt, recoveryCodesAvailable: !!acct.recoveryHashes?.length };
}
async function status(req: Request) {
  if (await isAdmin(req)) return { enabled: authEnabled(), signedIn: true, admin: true, name: "Admin", email: "Admin", used: 0, limit: 9999, left: 9999, resetAt: null };
  if (!authEnabled()) return { enabled: false, signedIn: false };
  const sess = await sessionFrom(req);
  const acct = sess ? await getJSON<Account>(await acctKey(sess.email)) : null;
  if (!acct?.passwordHash) {
    const q = quota(null);
    return { enabled: true, signedIn: false, used: q.used, limit: q.limit, left: q.left, resetAt: q.resetAt };
  }
  return publicAccount(acct);
}
async function issueSession(req: Request, acct: Account) {
  const old = await sessionFrom(req);
  if (old) await del(old.key);
  const token = randomHex(32);
  await setJSON("sess/" + await sha(token), { email: acct.email, kind: "password", authVersion: acct.authVersion ?? 0, created: Date.now(), exp: Date.now() + SESSION_TTL });
  return json(publicAccount(acct), 200, { "Set-Cookie": cookie(req, token, SESSION_TTL / 1000) });
}

// Each counter update is atomic in the backing store, including across function
// instances. Email and IP limits are independent so either can stop an attempt.
async function attemptLimit(email: string, ip: string, action: string) {
  const slot = Math.floor(Date.now() / (15 * 60 * 1000));
  const keys = [`attempt/ip/${slot}/${await sha(ip)}`, `attempt/email/${slot}/${await sha(email)}`];
  const caps = action === "signup" ? [10, 5] : action === "recovery" ? [20, 5] : [40, 10];
  for (let i = 0; i < keys.length; i++) if (await incrementJSONIfBelow(keys[i], caps[i]) == null) return false;
  return true;
}

const handle = async (req: Request, context: Context) => {
  if (req.method === "GET") return json(await status(req));
  if (req.method !== "POST") return json({ code: "invalid_request" }, 405);
  const origin = req.headers.get("origin");
  if ((origin && new URL(origin).host !== new URL(req.url).host) || req.headers.get("sec-fetch-site") === "cross-site") return json({ code: "invalid_request" }, 403);
  if (!authEnabled()) return json({ code: "auth_disabled" }, 404);
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ code: "invalid_request" }, 400);
  const raw = await req.text();
  if (raw.length > 4096) return json({ code: "invalid_request" }, 413);
  let body: any; try { body = JSON.parse(raw); } catch { return json({ code: "invalid_request" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ code: "invalid_request" }, 400);

  if (body.action === "signout") {
    const sess = await sessionFrom(req); if (sess) await del(sess.key);
    return json({ ok: true }, 200, { "Set-Cookie": cookie(req, "", 0) });
  }
  if (body.action === "generate-recovery") {
    const sess = await sessionFrom(req);
    const acct = sess ? await getJSON<Account>(await acctKey(sess.email)) : null;
    if (!sess || !acct?.passwordHash) return json({ code: "signin_required" }, 401);
    const codes = Array.from({ length: 10 }, () => randomHex(16).toUpperCase().match(/.{4}/g)!.join("-"));
    acct.recoveryHashes = await Promise.all(codes.map(code => sha(code.replaceAll("-", "").toLowerCase())));
    await setJSON(await acctKey(acct.email), acct);
    return json({ codes, recoveryCodesAvailable: true });
  }
  if (body.action === "reset-password") {
    const email = typeof body.email === "string" ? normEmail(body.email) : "";
    if (!validEmail(email)) return json({ code: "invalid_email" }, 400);
    if (!validPassword(body.password)) return json({ code: typeof body.password === "string" && body.password.length < 10 ? "password_too_short" : "invalid_password" }, 400);
    const normalizedCode = typeof body.code === "string" ? body.code.replace(/[-\s]/g, "").toLowerCase() : "";
    if (!(await attemptLimit(email, context.ip || "unknown", "recovery"))) return json({ code: "rate_limited" }, 429, { "Retry-After": "900" });
    if (!/^[a-f0-9]{32}$/.test(normalizedCode)) return json({ code: "invalid_recovery_code" }, 401);
    const key = await acctKey(email);
    const codeHash = await sha(normalizedCode);
    let acct = await getJSON<Account>(key);
    if (!acct?.passwordHash || !acct.recoveryHashes?.includes(codeHash)) return json({ code: "invalid_recovery_code" }, 401);
    const passwordHash = await hashPassword(body.password);
    if (!(await setJSONIfAbsent(`recovery-used/${codeHash}`, { usedAt: Date.now() }))) return json({ code: "invalid_recovery_code" }, 401);
    acct = await getJSON<Account>(key);
    if (!acct?.passwordHash || !acct.recoveryHashes?.includes(codeHash)) return json({ code: "invalid_recovery_code" }, 401);
    acct.passwordHash = passwordHash;
    acct.authVersion = (Number.isSafeInteger(acct.authVersion) && (acct.authVersion as number) >= 0 ? acct.authVersion as number : 0) + 1;
    await setJSON(key, acct);
    const clearCookie = cookie(req, "", 0);
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie });
  }
  if (!["signup", "signin"].includes(body.action)) return json({ code: "invalid_request" }, 400);
  const email = typeof body.email === "string" ? normEmail(body.email) : "";
  if (!validEmail(email)) return json({ code: "invalid_email" }, 400);
  if (!validPassword(body.password)) return json({ code: typeof body.password === "string" && body.password.length < 10 ? "password_too_short" : "invalid_password" }, 400);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (body.action === "signup" && (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name))) return json({ code: "invalid_name" }, 400);
  if (!(await attemptLimit(email, context.ip || "unknown", body.action))) return json({ code: "rate_limited" }, 429, { "Retry-After": "900" });
  const key = await acctKey(email);
  let acct = await getJSON<Account>(key);
  if (body.action === "signup") {
    // Never overwrite a legacy email-code account or its quota/history.
    if (acct) return json({ code: "account_exists" }, 409);
    acct = { email, name, passwordHash: await hashPassword(body.password), starts: [], ids: {}, created: Date.now() };
    await setJSON(key, acct);
  } else {
    if (!(await verifyPassword(body.password, acct?.passwordHash)) || !acct) return json({ code: "invalid_credentials" }, 401);
  }
  return issueSession(req, acct);
};

export default async (req: Request, context: Context) => {
  try {
    return req.method === "POST" ? await withStoreLock("council-auth", "writes", () => handle(req, context)) : await handle(req, context);
  } catch {
    console.error("[auth] Account storage unavailable.");
    return json({ code: "storage_unavailable", message: "Sign-in is temporarily unavailable. Please retry shortly." }, 503);
  }
};
export const config: Config = { path: "/api/auth" };
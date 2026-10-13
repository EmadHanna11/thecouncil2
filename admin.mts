import type { Context, Config } from "@netlify/functions";
import { ADMIN_COOKIE, adminPass, adminToken, checkAdminKey, isAdmin, getJSON, setJSON } from "../lib/auth.mts";
import { withStoreLock } from "../lib/store.mts";

// Owner-only page: enter SITE_PASSKEY once to mark this browser as admin (unlimited discussions, no email code).
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const shell = (inner: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>The Council · Admin</title>
<style>:root{--bg:#F1F2ED;--card:#fff;--ink:#131715;--muted:#5F6862;--line:#C6CBC2;--green:#0E7C5A;--err:#9C2A16;--errbg:#FCE8E4}
@media (prefers-color-scheme:dark){:root{--bg:#0F1311;--card:#161B18;--ink:#ECEFEC;--muted:#9BA49F;--line:#3A4540;--green:#3DBE8F;--err:#F4A18F;--errbg:#391C16}}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:15px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif;padding:16px}
.card{width:min(400px,100%);background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px 26px;display:flex;flex-direction:column;gap:14px}
h1{margin:0;font:400 26px Georgia,serif}p{margin:0;color:var(--muted)}label{font-size:12.5px;font-weight:600;color:var(--muted)}
input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--ink)}
.btn{display:block;text-align:center;text-decoration:none;font:inherit;font-weight:600;border:0;border-radius:999px;padding:13px;background:var(--green);color:#fff;cursor:pointer}
.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}.err{background:var(--errbg);color:var(--err);border-radius:10px;padding:9px 12px;font-size:13.5px}</style></head>
<body><div class="card">${inner}</div></body></html>`;
const page = (inner: string, status = 200, extra: Record<string, string> = {}) =>
  new Response(shell(inner), { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", ...extra } });
const form = (err = "") => `<h1>Admin</h1><p>Owner access to The Council.</p>${err ? `<div class="err">${esc(err)}</div>` : ""}
<form method="post" action="/admin" style="display:flex;flex-direction:column;gap:12px" autocomplete="off"><label for="k">Passkey</label><input id="k" name="key" type="password" required autofocus autocomplete="current-password"><button class="btn" type="submit">Sign in as admin</button></form>`;

const handle = async (req: Request, context: Context) => {
  const url = new URL(req.url);
  if (!adminPass()) return page(`<h1>Admin</h1><p>Admin access isn't set up. Add SITE_PASSKEY to your hosting secrets, then restart the app.</p>`, 404);
  if (url.pathname === "/admin/logout") return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  if (req.method === "POST") {
    const ip = (context.ip || "unknown").replace(/[^a-zA-Z0-9.:_-]/g, "_");
    const rk = `admin-fail/${new Date().toISOString().slice(0, 13)}/${ip}`;
    const fails = Number((await getJSON<number>(rk)) || 0);
    if (fails >= 10) return page(form("Too many attempts. Try again in an hour."), 429);
    const data = await req.formData().catch(() => null);
    if (await checkAdminKey(String(data?.get("key") || ""))) {
      return new Response(null, { status: 303, headers: { Location: "/", "Cache-Control": "no-store", "Set-Cookie": `${ADMIN_COOKIE}=${await adminToken()}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Lax` } });
    }
    await setJSON(rk, fails + 1);
    await new Promise(r => setTimeout(r, 900));
    return page(form("That passkey isn't right."), 401);
  }
  if (await isAdmin(req)) return page(`<h1>Admin</h1><p>This browser is signed in as admin: unlimited discussions, no email code needed.</p><a class="btn" href="/">Open The Council</a><a class="btn ghost" href="/admin/logout">Sign out of admin</a>`);
  return page(form());
};

export default async (req: Request, context: Context) => {
  try {
    return req.method === "POST"
      ? await withStoreLock("council-auth", "writes", () => handle(req, context))
      : await handle(req, context);
  } catch {
    console.error("[admin] Rate-limit storage unavailable.");
    return page("<h1>Admin</h1><p>Sign-in is temporarily unavailable. Please retry shortly.</p>", 503);
  }
};

export const config: Config = { path: ["/admin", "/admin/logout"] };

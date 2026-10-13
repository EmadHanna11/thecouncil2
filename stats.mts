import type { Context, Config } from "@netlify/functions";
import { getStore, withStoreLock } from "../lib/store.mts";

// Anonymous "most seated" counter. Stores only persona IDs per day — never questions or content.
const store = () => getStore({ name: "council-stats", consistency: "strong" });
const json = (v: unknown, status = 200, cache = "no-store") => new Response(JSON.stringify(v), { status, headers: { "Content-Type": "application/json", "Cache-Control": cache } });
const day = (d = new Date()) => d.toISOString().slice(0, 10);
let memo: { at: number; data: unknown } | null = null;

async function summary() {
  if (memo && Date.now() - memo.at < 10 * 60 * 1000) return memo.data;
  const s = store(); const totals: Record<string, number> = {}; let total = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const rec = (await s.get(`day/${day(d)}`, { type: "json" })) as { n?: number; c?: Record<string, number> } | null;
    if (!rec) continue; total += rec.n || 0;
    for (const [id, c] of Object.entries(rec.c || {})) totals[id] = (totals[id] || 0) + c;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => ({ id, count }));
  memo = { at: Date.now(), data: { total, top } };
  return memo.data;
}

const handle = async (req: Request, context: Context) => {
  if (req.method === "GET") return json(await summary(), 200, "public, max-age=300");
  if (req.method !== "POST") return json({ code: "invalid_request" }, 405);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ code: "invalid_request" }, 403);
  let body: any; try { body = await req.json(); } catch { return json({ code: "invalid_request" }, 400); }
  const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter((x: unknown) => typeof x === "string" && /^RT-\d{4}$/.test(x)))].slice(0, 5) as string[] : [];
  const did = String(body?.did || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  if (!ids.length || !did) return json({ code: "invalid_request" }, 400);
  const s = store();
  if (await s.get(`seen/${did}`)) return json({ ok: true, dup: true });            // each discussion counts once
  const ip = (context.ip || "x").replace(/[^a-zA-Z0-9.:_-]/g, "_"); const rk = `ip/${day()}/${ip}`;
  const n = Number((await s.get(rk)) || 0); if (n >= 20) return json({ ok: true, limited: true });  // anti-inflation
  await s.set(rk, String(n + 1)); await s.set(`seen/${did}`, "1");
  const key = `day/${day()}`; const rec = ((await s.get(key, { type: "json" })) as { n: number; c: Record<string, number> } | null) || { n: 0, c: {} };
  rec.n += 1; for (const id of ids) rec.c[id] = (rec.c[id] || 0) + 1;
  await s.setJSON(key, rec); memo = null;
  return json({ ok: true });
};

export default async (req: Request, context: Context) => {
  try {
    return req.method === "POST"
      ? await withStoreLock("council-stats", "writes", () => handle(req, context))
      : await handle(req, context);
  } catch {
    console.error("[stats] Statistics storage unavailable.");
    return json({ code: "storage_unavailable" }, 503);
  }
};

export const config: Config = { path: "/api/stats" };

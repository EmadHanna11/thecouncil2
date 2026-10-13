import type { Context, Config } from "@netlify/functions";
import { getStore, withStoreLock } from "../lib/store.mts";
import { authEnabled, sessionFrom, getJSON, setJSON, quota, acctKey, isAdmin, type Account } from "../lib/auth.mts";
import { hostRoom, RoomError } from "../lib/rooms.mts";
// @ts-ignore — generated JS module (server-only prompts)
import { pickPrompt, contributionPrompt, synthesisPrompt } from "../lib/prompts.mjs";

// The Council — AI gateway. Keys live in Netlify environment variables, never in the page.
// AI_PROVIDER = kimi | openai | claude  (default: kimi)
// MOONSHOT_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY
// Optional: KIMI_MODEL, OPENAI_MODEL, CLAUDE_MODEL, AI_FALLBACK_PROVIDER, DAILY_CALL_LIMIT (per visitor, default 150)
// Password sign-in is on by default; REQUIRE_SIGNIN=0 disables it.
// DISCUSSIONS_PER_DAY (default 2); CALLS_PER_ACCOUNT_DAY (default 120).

type Provider = "kimi" | "openai" | "claude";
type Turn = { role: "user" | "assistant"; content: string };

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function keyFor(p: Provider) {
  return p === "kimi" ? Netlify.env.get("MOONSHOT_API_KEY") : p === "openai" ? Netlify.env.get("OPENAI_API_KEY") : Netlify.env.get("ANTHROPIC_API_KEY");
}
function providers(): Provider[] {
  const main = (Netlify.env.get("AI_PROVIDER") || "kimi").toLowerCase() as Provider;
  const fb = (Netlify.env.get("AI_FALLBACK_PROVIDER") || "").toLowerCase() as Provider;
  return [main, fb].filter((p, i, a) => ["kimi", "openai", "claude"].includes(p) && a.indexOf(p) === i && keyFor(p));
}

async function callProvider(p: Provider, turns: Turn[], tier: string, signal: AbortSignal): Promise<Response> {
  const key = keyFor(p)!;
  const maxTokens = tier === "quick" ? 1200 : 2400;
  if (p === "claude") {
    const model = Netlify.env.get("CLAUDE_MODEL") || "claude-sonnet-4-5";
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal,
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: maxTokens, stream: true, messages: turns }),
    });
  }
  const url = p === "kimi" ? "https://api.moonshot.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const model = p === "kimi" ? Netlify.env.get("KIMI_MODEL") || "kimi-k2.6" : Netlify.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
  const extra = p === "kimi" && model === "kimi-k2.6" ? { thinking: { type: "disabled" } } : {};
  return fetch(url, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, stream: true, max_tokens: maxTokens, messages: turns, ...extra }),
  });
}

// Turn the provider's event stream into plain text chunks.
function toTextStream(p: Provider, body: ReadableStream<Uint8Array>) {
  const dec = new TextDecoder(); const enc = new TextEncoder(); let buf = "";
  return body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctrl) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() || "";
      for (const line of lines) {
        const l = line.trim(); if (!l.startsWith("data:")) continue;
        const data = l.slice(5).trim(); if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          const piece = p === "claude" ? (ev.type === "content_block_delta" ? ev.delta?.text : "") : ev.choices?.[0]?.delta?.content;
          if (piece) ctrl.enqueue(enc.encode(piece));
        } catch { /* ignore keep-alives */ }
      }
    },
  }));
}

async function underLimit(req: Request, context: Context) {
  const limit = Number(Netlify.env.get("DAILY_CALL_LIMIT") || 150);
  if (!limit) return true;
  const ip = context.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const store = getStore("council-usage");
  const k = `${day}/${ip.replace(/[^a-zA-Z0-9.:_-]/g, "_")}`;
  return withStoreLock("council-usage", k, async () => {
    const used = Number((await store.get(k)) || 0);
    if (!Number.isSafeInteger(used) || used < 0) throw new Error("Invalid usage counter.");
    if (used >= limit) return false;
    await store.set(k, String(used + 1));
    return true;
  });
}

// ---- task validation + prompt building ----
const str = (v: unknown, max: number) => typeof v === "string" ? v.slice(0, max) : "";
export function cleanSession(s: any) {
  if (!s || typeof s !== "object") throw new Error("session");
  if (!Array.isArray(s.seats) || !s.seats.length || s.seats.length > 5 || !s.seats.every((x: unknown) => typeof x === "string")) throw new Error("seats");
  if (!Array.isArray(s.messages) || s.messages.length > 600) throw new Error("messages");
  const customs = Array.isArray(s.customs) ? s.customs.slice(0, 5).map((c: any) => ({ id: str(c?.id, 40), type: "custom", name: str(c?.name, 80), brief: str(c?.brief, 1200), worldview: str(c?.worldview, 1200), values: str(c?.values, 600) })) : [];
  return {
    question: str(s.question, 600), context: str(s.context, 1200), mode: str(s.mode, 20), style: str(s.style, 20), length: str(s.length, 10),
    religious: str(s.religious, 20), lang: s.lang === "ar" ? "ar" : "en", seats: s.seats.map((x: string) => x.slice(0, 40)), customs,
    reasons: s.reasons && typeof s.reasons === "object" && !Array.isArray(s.reasons)
      ? Object.fromEntries(Object.entries(s.reasons).slice(0, 5).map(([key, value]: [string, any]) =>
        [key.slice(0, 40), { why: str(value?.why, 1200), position: str(value?.position, 200) }])) : {},
    pins: Array.isArray(s.pins) ? s.pins.slice(0, 50).filter((p: unknown) => typeof p === "string").map((p: string) => p.slice(0, 40)) : [],
    messages: s.messages.map((m: any) => ({ id: str(m?.id, 40), type: str(m?.type, 12), pid: str(m?.pid, 40), to: str(m?.to, 40), text: str(m?.text, 6000),
      authorName: str(m?.authorName, 80), contributionKind: str(m?.contributionKind, 20),
      stance: typeof m?.stance === "number" ? m.stance : null, position: str(m?.position, 200), round: typeof m?.round === "number" ? m.round : 1, demo: !!m?.demo })),
  };
}
function buildPrompt(body: any, list: string[]) {
  const task = body?.task;
  if (task === "pick") {
    const count = Math.max(2, Math.min(5, Number(body.count) || 5));
    const skip = list[0] === "kimi" && list.length === 1 ? ["RT-0069"] : [];
    return pickPrompt({ q: str(body.q, 600), ctx: str(body.ctx, 1200), topic: str(body.topic, 60), goal: str(body.goal, 60), count, lang: body.lang === "ar" ? "ar" : "en", skip }) + "\n\nReply with the JSON object only.";
  }
  if (task === "contribute") {
    const s = cleanSession(body.s); const seat = Number(body.seat);
    if (!Number.isInteger(seat) || seat < 0 || seat >= s.seats.length) throw new Error("seat");
    return contributionPrompt(s, seat);
  }
  if (task === "synthesize") return synthesisPrompt(cleanSession(body.s));
  throw new Error("unknown task");
}

export default async (req: Request, context: Context) => {
  const list = providers();
  if (req.method === "GET") return json({ live: list.length > 0, provider: list[0] || null, providers: list, auth: authEnabled() });
  if (req.method !== "POST") return json({ code: "invalid_request" }, 405);
  const origin = req.headers.get("origin");
  try {
    if ((origin && new URL(origin).host !== new URL(req.url).host) || req.headers.get("sec-fetch-site") === "cross-site")
      return json({ code: "invalid_request", message: "origin" }, 403);
  } catch { return json({ code: "invalid_request" }, 403); }

  // Only Council tasks are accepted; the prompts themselves are built here on the server and never leave it.
  const raw = await req.text();
  if (raw.length > 400000) return json({ code: "prompt_too_large" }, 413);
  let body: any; try { body = JSON.parse(raw); } catch { return json({ code: "invalid_request" }, 400); }
  let roomDiscussion = "";
  if (body?.roomId !== undefined) {
    try {
      const room = await hostRoom(req, body.roomId);
      if (!room.busy || room.busy.token !== body.roomToken) return json({ code: "host_only" }, 403);
      if (!["contribute", "synthesize"].includes(body.task)) return json({ code: "invalid_request" }, 400);
      // Never trust a guest-provided transcript or account/discussion ID.
      body.s = room.s;
      body.seat = room.s.turn % room.s.seats.length;
      roomDiscussion = room.s.id;
    } catch (error) {
      if (error instanceof RoomError) return json({ code: error.code }, error.status);
      return json({ code: "storage_unavailable" }, 503);
    }
  }
  if (!list.length) return json({ code: "sampling_disabled", message: "No AI provider key is configured." }, 503);
  let prompt = "";
  try { prompt = buildPrompt(body, list); } catch (e) { return json({ code: "invalid_request", message: String((e as Error)?.message || e) }, 400); }
  if (prompt.length > 70000) return json({ code: "prompt_too_large" }, 413);
  const turns: Turn[] = [{ role: "user", content: prompt }];
  const admin = !roomDiscussion && await isAdmin(req);

  // Signed-in quota: each new discussion uses one of the daily slots; continuing a discussion is free.
  const quotaHeaders: Record<string, string> = {};
  let premium = false;
  if ((authEnabled() || roomDiscussion) && !admin) {
    let rejection: Response | null;
    try { rejection = await withStoreLock("council-auth", "writes", async () => {
    const sess = await sessionFrom(req);
    if (!sess) return json({ code: "signin_required", message: "Please sign in with your email." }, 401);
    const did = (roomDiscussion || req.headers.get("x-council-discussion") || "none").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "none";
    const key = await acctKey(sess.email);
    const acct: Account = (await getJSON<Account>(key)) || { email: sess.email, starts: [], ids: {} };
    const q = quota(acct); acct.starts = q.starts; acct.ids = acct.ids || {};
    premium = q.unlimited;
    if (!acct.ids[did]) {
      if (!q.unlimited && q.left <= 0) return json({ code: "quota_exceeded", used: q.used, limit: q.limit, resetAt: q.resetAt }, 429);
      acct.starts.push(Date.now()); acct.ids[did] = Date.now();
      acct.ids = Object.fromEntries(Object.entries(acct.ids).sort((x, y) => y[1] - x[1]).slice(0, 300));
    }
    const today = new Date().toISOString().slice(0, 10);
    acct.calls = { [today]: (acct.calls?.[today] || 0) + 1 };
    const cap = Number(Netlify.env.get("CALLS_PER_ACCOUNT_DAY") || 120);
    if (!q.unlimited && cap && acct.calls[today] > cap) return json({ code: "rate_limited", message: "daily call limit" }, 429);
    await setJSON(key, acct);
    const q2 = quota(acct);
    Object.assign(quotaHeaders, { "X-Council-Used": String(q2.used), "X-Council-Limit": String(q2.limit), "X-Council-Reset": String(q2.resetAt || ""), "X-Council-Unlimited": String(q2.unlimited) });
    return null;
    }); } catch {
      console.error("[ai] Account quota storage unavailable.");
      return json({ code: "storage_unavailable", message: "Usage checks are temporarily unavailable. Please retry shortly." }, 503);
    }
    if (rejection) return rejection;
  }

  if (!admin && !premium) try { if (!(await underLimit(req, context))) return json({ code: "rate_limited", message: "daily limit" }, 429); }
  catch {
    console.error("[ai] Usage storage unavailable.");
    return json({ code: "storage_unavailable", message: "Usage checks are temporarily unavailable. Please retry shortly." }, 503);
  }

  let lastStatus = 0; let lastDetail = "";
  for (const p of list) {
    try {
      const r = await callProvider(p, turns, body.tier || "default", req.signal);
      if (r.ok && r.body) return new Response(toTextStream(p, r.body), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-AI-Provider": p, ...quotaHeaders } });
      lastStatus = r.status; lastDetail = `${p}: ${(await r.text()).slice(0, 240)}`; console.error(`[ai] ${lastDetail}`);
    } catch (e) { console.error(`[ai] ${p} failed`, e); }
  }
  return json({ code: lastStatus === 429 ? "rate_limited" : "upstream_error", message: `provider status ${lastStatus} — ${lastDetail}` }, lastStatus === 429 ? 429 : 502);
};

export const config: Config = { path: "/api/ai" };

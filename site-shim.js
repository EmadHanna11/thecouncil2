<script>
/* The Council — website bridge: routes AI requests through /api/ai (your key stays on the server). */
(() => {
  window.COUNCIL_SITE = true;
  let live = null;
  const KIMI_REFUSES = ["RT-0069"];
  const status = fetch("/api/ai", { cache: "no-store" }).then(r => r.ok ? r.json() : { live: false }).catch(() => ({ live: false }))
    .then(st => { const list = st.providers || (st.provider ? [st.provider] : []); if (list[0] === "kimi" && list.length === 1) window.COUNCIL_SKIP = KIMI_REFUSES; return st; });
  /* Account sessions are cookie-backed; never store credentials or bearer tokens in the browser. */
  try { localStorage.removeItem("council-auth"); } catch {}
  const A = { enabled: true, checking: true, unavailable: false, signedIn: false, name: null, email: null, premium: false, unlimited: false, used: 0, limit: 2, left: 2, resetAt: null, recoveryCodesAvailable: false };
  const emit = () => window.dispatchEvent(new CustomEvent("council-auth", { detail: { ...A } }));
  function apply(d) {
    if (!d) return;
    if ("enabled" in d) A.enabled = !!d.enabled;
    if ("signedIn" in d) A.signedIn = !!d.signedIn;
    if ("name" in d) A.name = d.name || null;
    if ("email" in d) A.email = d.email || null;
    if ("premium" in d) A.premium = !!d.premium;
    if ("unlimited" in d) A.unlimited = !!d.unlimited;
    if (d.signedIn === false) { A.name = null; A.email = null; A.recoveryCodesAvailable = false; A.premium = false; A.unlimited = false; }
    if (d.limit != null) A.limit = +d.limit;
    if (d.used != null) A.used = +d.used;
    A.left = d.left != null ? Math.max(0, +d.left) : Math.max(0, A.limit - A.used);
    if ("resetAt" in d) A.resetAt = d.resetAt ? +d.resetAt : null;
    if ("admin" in d) A.admin = !!d.admin;
    if ("recoveryCodesAvailable" in d) A.recoveryCodesAvailable = !!d.recoveryCodesAvailable;
    A.checking = false;
    A.unavailable = false;
    emit();
  }
  const failClosed = () => { A.enabled = true; A.checking = false; A.unavailable = true; A.signedIn = false; A.name = null; A.email = null; emit(); return A; };
  const getStatus = async () => {
    try {
      const r = await fetch("/api/auth", { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) return failClosed();
      const d = await r.json();
      apply(d);
      return A;
    } catch { return failClosed(); }
  };
  async function post(body) {
    let r;
    try { r = await fetch("/api/auth", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
    catch { failClosed(); throw { code: "storage_unavailable" }; }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status >= 500) { A.enabled = true; A.unavailable = true; A.checking = false; emit(); }
      throw { code: d.code || (r.status >= 500 ? "storage_unavailable" : "error"), ...d };
    }
    return d;
  }
  const ready = getStatus();
  window.COUNCIL_AUTH = {
    get state() { return A; }, ready,
    signup: async (name, email, password) => { const d = await post({ action: "signup", name, email, password }); apply(d); return A; },
    signIn: async (email, password) => { const d = await post({ action: "signin", email, password }); apply(d); return A; },
    generateRecoveryCodes: async () => { const d = await post({ action: "generate-recovery" }); A.recoveryCodesAvailable = true; emit(); return d.codes; },
    resetPassword: async (email, code, password) => { const d = await post({ action: "reset-password", email, code, password }); await getStatus(); return d; },
    signOut: async () => { try { await post({ action: "signout" }); } finally { await getStatus(); } return A; },
    refresh: async () => { await getStatus(); return A; }
  };

  /* anonymous "most seated" rankings (persona IDs only) */
  window.COUNCIL_STATS = { state: null, record: (ids, did) => fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, did }), keepalive: true }).catch(() => {}) };
  fetch("/api/stats").then(r => r.ok ? r.json() : null).then(d => { if (d){ window.COUNCIL_STATS.state = d; window.dispatchEvent(new Event("council-stats")); } }).catch(() => {});

  async function sample(input, opts = {}) {
    if (!(await status).live) throw { code: "sampling_disabled", message: "AI is not configured on this site." };
    let res;
    const did = (window.__councilSid && window.__councilSid()) || "none";
    try { res = await fetch("/api/ai", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Council-Discussion": did }, body: JSON.stringify(input && typeof input === "object" && input.task ? { ...input, tier: opts.modelTier || "default" } : { input, tier: opts.modelTier || "default" }), signal: opts.signal }); }
    catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "upstream_error", message: String(e && e.message || e) }; }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      if (d.code === "signin_required") { apply({ signedIn: false, name: null, email: null }); }
      if (d.code === "quota_exceeded") apply({ used: d.used, limit: d.limit, resetAt: d.resetAt });
      throw { code: d.code || "upstream_error", message: d.message || String(res.status), resetAt: d.resetAt };
    }
    const qu = res.headers.get("x-council-used");
    if (qu != null) apply({ used: qu, limit: res.headers.get("x-council-limit"), resetAt: res.headers.get("x-council-reset") || null, premium: res.headers.get("x-council-unlimited") === "true", unlimited: res.headers.get("x-council-unlimited") === "true" });
    const reader = res.body.getReader(); const dec = new TextDecoder(); let text = "";
    try {
      for (;;) { const { done, value } = await reader.read(); if (done) break; const delta = dec.decode(value, { stream: true }); if (!delta) continue; text += delta; opts.onText && opts.onText({ text, delta }); }
    } catch (e) { throw { code: opts.signal && opts.signal.aborted ? "cancelled" : "upstream_error", message: "stream interrupted", text }; }
    if (!text.trim()) throw { code: "empty_completion", message: "empty" };
    return { text, truncated: false, modelTierApplied: opts.modelTier || "default" };
  }
  sample.json = async (input, opts = {}) => {
    const r = await sample(input, opts); const t = r.text.trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/); const body = fence ? fence[1] : t.slice(Math.min(...["{", "["].map(c => t.indexOf(c)).filter(i => i >= 0)));
    try { return JSON.parse(body.slice(0, Math.max(body.lastIndexOf("}"), body.lastIndexOf("]")) + 1)); } catch { throw { code: "invalid_json", message: "not json", text: r.text }; }
  };
  const downloads = { save: async ({ filename, data }) => { const url = URL.createObjectURL(new Blob([data], { type: "text/markdown;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); } };
  window.claude = { use: async n => n === "sample" ? ((await status).live ? sample : null) : n === "downloads" ? downloads : null };
})();
</script>

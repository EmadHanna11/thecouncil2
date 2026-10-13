/* The Council browser-only discussion backup format. Classic-script compatible. */
(function (root) {
  "use strict";
  const MAX_BYTES = 10 * 1024 * 1024;
  const MAX_DISCUSSIONS = 1000;
  // Built-in persona IDs include compact catalogue keys such as RT-0001.
  const ID = /^[A-Za-z0-9_-]{1,100}$/;
  const MODES = new Set(["explore", "decide", "stress", "brainstorm", "debate"]);
  const SESSION_KEYS = new Set([
    "id", "preseat", "question", "context", "topic", "mode", "goal", "lang", "count", "style",
    "length", "rounds", "religious", "seats", "reasons", "customs", "pins", "checks", "followups",
    "messages", "turn", "stage", "synthesis", "pickedBy", "createdAt", "updatedAt", "hostDraft",
    "to", "nextPid", "suggest", "synthDemo", "example", "demo", "touched", "statsSent"
  ]);
  const MESSAGE_KEYS = new Set([
    "id", "type", "text", "pid", "round", "gap", "stance", "position", "ask", "counted",
    "demo", "interrupted", "to"
  ]);
  const PERSONA_KEYS = new Set(["id", "type", "name", "ar", "domain", "sub", "tagline", "brief", "worldview", "values", "gender"]);
  const fail = (code, index) => ({ ok: false, error: code, index });
  function cleanText(value, max, optional = false) {
    if (optional && value == null) return true;
    // Discussion content is plain text, including code examples and angle
    // brackets. The app's esc()/inline()/md() escape it when rendering.
    return typeof value === "string" && value.length <= max;
  }
  function validateDiscussion(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) return "shape";
    if (Object.keys(s).some(k => !SESSION_KEYS.has(k))) return "unknown";
    if (typeof s.id !== "string" || !ID.test(s.id)) return "id";
    if (s.preseat != null && s.preseat !== "" && (typeof s.preseat !== "string" || !ID.test(s.preseat))) return "shape";
    if (!cleanText(s.question, 600) || s.question.trim().length < 1) return "question";
    for (const k of ["context", "topic", "goal", "style", "length", "religious", "synthesis", "hostDraft", "suggest"]) {
      if (s[k] != null && !cleanText(s[k], k === "synthesis" ? 120000 : 4000, true)) return "text";
    }
    if (!MODES.has(s.mode) || !["en", "ar"].includes(s.lang) ||
        !Number.isInteger(s.count) || s.count < 2 || s.count > 5 ||
        !Number.isInteger(s.rounds) || s.rounds < 1 || s.rounds > 8 ||
        !Number.isInteger(s.turn) || s.turn < 0 || s.turn > 400 ||
        !["assemble", "discuss"].includes(s.stage) ||
        !Number.isFinite(s.createdAt) || !Number.isFinite(s.updatedAt)) return "shape";
    if (!Array.isArray(s.seats) || s.seats.length < (s.stage === "assemble" ? 0 : 2) || s.seats.length > 5 ||
        s.seats.some(x => typeof x !== "string" || !ID.test(x)) || new Set(s.seats).size !== s.seats.length) return "seats";
    if (!Array.isArray(s.customs) || s.customs.length > 50) return "personas";
    const customIds = new Set();
    for (const p of s.customs) {
      if (!p || typeof p !== "object" || Array.isArray(p) || Object.keys(p).some(k => !PERSONA_KEYS.has(k)) ||
          typeof p.id !== "string" || !ID.test(p.id) || customIds.has(p.id) || p.type !== "custom" ||
          !cleanText(p.name, 100) || !p.name.trim()) return "personas";
      customIds.add(p.id);
      for (const k of ["ar", "domain", "sub", "tagline", "brief", "worldview", "values", "gender"])
        if (p[k] != null && !cleanText(p[k], 4000, true)) return "personas";
    }
    if (s.seats.some(id => !/^RT-\d{4}$/.test(id) && !customIds.has(id))) return "personas";
    if (!Array.isArray(s.messages) || s.messages.length > 20000) return "messages";
    const messageIds = new Set();
    for (const m of s.messages) {
      if (!m || typeof m !== "object" || Array.isArray(m) || Object.keys(m).some(k => !MESSAGE_KEYS.has(k)) ||
          typeof m.id !== "string" || !ID.test(m.id) || messageIds.has(m.id) ||
          !["host", "persona", "mod", "event", "recap"].includes(m.type) || !cleanText(m.text, 120000)) return "messages";
      messageIds.add(m.id);
      if (m.pid != null && (typeof m.pid !== "string" || !ID.test(m.pid))) return "messages";
      if (m.to != null && m.to !== "all" && (typeof m.to !== "string" || !ID.test(m.to))) return "messages";
      if (m.round != null && (!Number.isInteger(m.round) || m.round < 1 || m.round > 8)) return "messages";
      if (m.stance != null && (typeof m.stance !== "number" || !Number.isFinite(m.stance) || m.stance < -2 || m.stance > 2)) return "messages";
      if (m.gap != null && (!Array.isArray(m.gap) || m.gap.length !== 2 ||
          m.gap.some(id => typeof id !== "string" || !ID.test(id)))) return "messages";
      for (const k of ["position", "ask"])
        if (m[k] != null && !cleanText(m[k], 4000, true)) return "messages";
      for (const k of ["counted", "demo", "interrupted"])
        if (m[k] != null && typeof m[k] !== "boolean") return "messages";
    }
    if (!Array.isArray(s.pins) || s.pins.length > s.messages.length || s.pins.some(id => typeof id !== "string" || !messageIds.has(id)) ||
        new Set(s.pins).size !== s.pins.length) return "pins";
    if (!Array.isArray(s.followups) || s.followups.length > 30 || s.followups.some(x => !cleanText(x, 2000))) return "brief";
    if (s.checks != null && (!s.checks || typeof s.checks !== "object" || Array.isArray(s.checks) ||
        Object.keys(s.checks).length > 500 || Object.values(s.checks).some(v => typeof v !== "boolean"))) return "brief";
    if (s.reasons != null && (!s.reasons || typeof s.reasons !== "object" || Array.isArray(s.reasons) ||
        Object.keys(s.reasons).length > 100 || Object.values(s.reasons).some(v => !v || typeof v !== "object" || Array.isArray(v) ||
          Object.keys(v).some(k => !["why", "position"].includes(k)) ||
          Object.values(v).some(x => !cleanText(x, 4000))))) return "shape";
    for (const k of ["synthDemo", "example", "demo", "touched", "statsSent"])
      if (s[k] != null && typeof s[k] !== "boolean") return "shape";
    if (s.pickedBy != null && !["ai", "quick", ""].includes(s.pickedBy)) return "shape";
    if (s.to != null && s.to !== "all" && (typeof s.to !== "string" || !ID.test(s.to))) return "shape";
    if (s.nextPid != null && s.nextPid !== "" && (typeof s.nextPid !== "string" || !ID.test(s.nextPid))) return "shape";
    return "";
  }
  function validateBackup(data, rawSize) {
    if (rawSize != null && rawSize > MAX_BYTES) return fail("too_large");
    if (!data || typeof data !== "object" || Array.isArray(data) || data.format !== "the-council-backup" ||
        Object.keys(data).some(k => !["format", "version", "exportedAt", "discussions"].includes(k)) ||
        data.version !== 1 || typeof data.exportedAt !== "string" || data.exportedAt.length > 40 ||
        !Number.isFinite(Date.parse(data.exportedAt)) || !Array.isArray(data.discussions)) return fail("format");
    if (data.discussions.length > MAX_DISCUSSIONS) return fail("capacity");
    const seen = new Set();
    for (let i = 0; i < data.discussions.length; i++) {
      const reason = validateDiscussion(data.discussions[i]);
      if (reason) return fail(reason, i);
      if (seen.has(data.discussions[i].id)) return fail("duplicate", i);
      seen.add(data.discussions[i].id);
    }
    return { ok: true, discussions: data.discussions.map(s => JSON.parse(JSON.stringify(s))) };
  }
  function merge(existing, imported) {
    const valid = validateBackup(imported);
    if (!valid.ok) return { ...valid, discussions: existing.slice(), restored: 0, skipped: 0 };
    const base = Array.isArray(existing) ? existing : [];
    const known = new Set(base.map(s => s && s.id).filter(Boolean));
    const additions = valid.discussions.filter(s => !known.has(s.id));
    const skipped = valid.discussions.length - additions.length;
    if (base.length + additions.length > MAX_DISCUSSIONS)
      return { ...fail("capacity"), discussions: base.slice(), restored: 0, skipped: 0 };
    return { ok: true, discussions: [...additions, ...base], restored: additions.length, skipped };
  }
  function exportBackup(discussions, exportedAt) {
    const data = { format: "the-council-backup", version: 1, exportedAt: exportedAt || new Date().toISOString(), discussions };
    const result = validateBackup(data);
    if (!result.ok) throw Object.assign(new Error(result.error), { code: result.error, index: result.index });
    const json = JSON.stringify(data, null, 2);
    if (typeof TextEncoder !== "undefined" && new TextEncoder().encode(json).length > MAX_BYTES)
      throw Object.assign(new Error("too_large"), { code: "too_large" });
    return json;
  }
  const api = { MAX_BYTES, MAX_DISCUSSIONS, validateBackup, validateDiscussion, merge, exportBackup };
  root.COUNCIL_BACKUPS = api;
  if (typeof globalThis !== "undefined") globalThis.COUNCIL_BACKUPS = api;
})(typeof window !== "undefined" ? window : globalThis);
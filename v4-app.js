
/* ================= app layer (v4) ================= */
Object.assign(ICONS, {
  pin:'<path d="M9 4h6l-1 5 4 3v2H6v-2l4-3zM12 14v7"/>', reply:'<path d="M10 8 5 12l5 4M5 12h9a5 5 0 0 1 5 5v1"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z"/>', device:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>', scale:'<path d="M12 4v16M7 20h10M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>',
  debate:'<path d="M3 5h11v8H8l-5 3.5zM21 9v8.5L16 15h-5v-2"/>', alert:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M12 8v5M12 16.2v.3"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>', keys:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
  swap:'<path d="M7 7h13l-4-4M17 17H4l4 4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
  login:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M11 16l4-4-4-4M15 12H4"/>', at:'<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>'
});
const LOGO_LIGHT = "__LOGO_LIGHT__", LOGO_DARK = "__LOGO_DARK__";
const logoImg = (h, cls = "") => `<img class="logo-light ${cls}" src="${LOGO_LIGHT}" alt="Emad Hanna" style="height:${h}px;width:auto"><img class="logo-dark ${cls}" src="${LOGO_DARK}" alt="Emad Hanna" style="height:${h}px;width:auto">`;
function mark({ state = "idle", active = -1, cls = "", label = "" } = {}){
  const rots = [0, 72, 144, 216, 288];
  return `<svg class="mk ${state} ${cls}" viewBox="0 0 100 100" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} fill="none" stroke-width="7" stroke-linecap="round"><g class="orb">${rots.map((a, i) => `<g transform="rotate(${a} 50 50)"><line class="s${i === 4 ? " dissent" : ""}${i === active ? " on" : ""}"${i === active ? ` style="--seat:var(--s${i})"` : ""} x1="50" y1="12" x2="50" y2="34"/></g>`).join("")}</g><circle class="dot" cx="50" cy="50" r="5.5"/></svg>`;
}
// hover link between seat cards and chairs
(() => { const st = document.createElement("style"); st.textContent = [0,1,2,3,4].map(i => `.asm:has(.pick[data-i="${i}"]:hover) .seat[data-i="${i}"],.asm:has(.pick[data-i="${i}"]:focus-within) .seat[data-i="${i}"]{background:var(--surface-2)}.asm:has(.pick[data-i="${i}"]:hover) .seat[data-i="${i}"] .av{box-shadow:0 0 0 4px var(--green-soft)}`).join("") + ".seg{flex-wrap:wrap}"; document.head.appendChild(st); })();

/* ---------- state ---------- */
const prefs = Object.assign({ lang: "", onboarded: false, theme: "system", signedOut: false }, store.get(PREF_KEY, {})); delete prefs.demo;
/* ---------- theme: system / light / dark ---------- */
const ROOT_EL = document.documentElement; let hostTheme = ROOT_EL.getAttribute("data-theme"); let themeWriting = false;
const sysDark = () => { try { return matchMedia("(prefers-color-scheme: dark)").matches; } catch { return false; } };
const effTheme = () => prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : (hostTheme === "light" || hostTheme === "dark" ? hostTheme : (sysDark() ? "dark" : "light"));
function applyTheme(){
  const want = prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : hostTheme;
  themeWriting = true;
  if (want) { if (ROOT_EL.getAttribute("data-theme") !== want) ROOT_EL.setAttribute("data-theme", want); } else ROOT_EL.removeAttribute("data-theme");
  themeWriting = false;
}
try { new MutationObserver(() => { if (themeWriting) return; const cur = ROOT_EL.getAttribute("data-theme"); const mine = prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : null; if (mine && cur !== mine){ hostTheme = cur; applyTheme(); } else if (!mine) hostTheme = cur; }).observe(ROOT_EL, { attributes: true, attributeFilter: ["data-theme"] }); } catch {}
applyTheme();
const state = {
  view: "splash",
  lang: prefs.lang === "ar" ? "ar" : "en",
  draft: { question: "", context: "", topic: "", mode: "explore", count: 5, dlang: prefs.lang === "ar" ? "ar" : "en" },
  histQ: "", mention: null,
  history: store.get(HISTORY_KEY, []).filter(s => s && s.id && Array.isArray(s.seats)),
  s: null, mode: "checking", demoChosen: false, liveBlocked: "", capsSettled: false,
  busy: false, busyKind: "", busyLabel: "", speaking: -1, autoplay: false,
  picking: false, pickMode: "", justSeated: false,
  menu: "", modal: null, lib: null, panelOpen: false, backupResult: "", recoveryCodes: [], recoveryBusy: false, me: { id: null, name: "", avatarUrl: "" }
};
// Private room creation may snapshot only the active, idle session. Never persist this state to browser history.
window.COUNCIL_DISCUSSION = window.COUNCIL_DISCUSSION || {};
window.COUNCIL_DISCUSSION.snapshot = () => {
  if (state.view !== "discuss" || state.busy || !state.s) return null;
  try { return JSON.parse(JSON.stringify(state.s)); } catch { return null; }
};
window.COUNCIL_DISCUSSION.personaName = (id, session) => nameOf(personaOf(session || state.s || {}, id));
window.COUNCIL_DISCUSSION.signIn = () => gotoSignin();
let sample = null, downloads = null, userCap = null, db = null, ctl = null;
const ar = () => state.lang === "ar";
const t = (en, a) => ar() ? a : en;
const nameOf = p => p ? (ar() && p.ar ? p.ar : p.name) : "";
const domainOf = p => p ? (p.type === "custom" ? t("Custom","مخصص") : ar() ? (DOMAIN_AR[p.domain] || p.domain) : p.domain) : "";
const typeLabel = p => p.type === "custom" ? t("Your custom perspective","منظور مخصص") : p.type === "Historical figure" ? t("Inspired AI simulation","محاكاة مستوحاة") : p.type === "Living public figure" ? t("Inspired AI simulation · living figure","محاكاة مستوحاة · شخصية معاصرة") : t("Professional archetype","منظور مهني");
const fem = p => p && p.gender === "Female";
const ERAS = ["Contemporary","Modern","Enlightenment","Early Modern","Reformation","Renaissance","Medieval","Ancient"];
const ERA_AR = { Contemporary: "معاصر", Modern: "حديث", Enlightenment: "عصر التنوير", "Early Modern": "بدايات العصر الحديث", Reformation: "عصر الإصلاح", Renaissance: "عصر النهضة", Medieval: "العصور الوسطى", Ancient: "قديم" };
const opt = rows => rows.map(r => [r[0], ar() ? r[2] : r[1]]);
const initials = p => { const n = (p.name || "?").replace(/\(.*?\)/g, "").trim().split(/\s+/).filter(w => /^[A-Za-z]/.test(w)); if (!n.length) return (p.name || "?").trim().slice(0, 2); return ((n[0][0] || "?") + (n.length > 1 ? n[n.length - 1][0] : (n[0][1] || ""))).toUpperCase(); };
const personaOf = (s, id) => BY_ID.get(id) || (s.customs || []).find(c => c.id === id) || (id ? { id, name: t("Former participant","مشارك سابق"), ar: "مشارك سابق", type: "custom", domain: "Custom", domains: ["Custom"], sub: "", tagline: "", brief: "", worldview: "", values: "", retired: true } : undefined);
const seatPeople = s => s.seats.map(id => personaOf(s, id));
const firstName = () => (state.me.name || "").split(/\s+/)[0];
/* ---------- website accounts (cookie-backed, when available) ---------- */
const AUTH = window.COUNCIL_AUTH || null;
const authOn = () => !!(AUTH && (AUTH.state.enabled || AUTH.state.unavailable || AUTH.state.checking));
const signedSite = () => authOn() && !!AUTH.state.signedIn;
const passwordSiteAccount = () => signedSite() && !AUTH.state.admin;
state.auth = { step: "signin", email: "", name: "", password: "", confirm: "", busy: false, err: "" };
window.__councilSid = () => (state.s && state.s.id) || "";
window.addEventListener("council-stats", () => { if (state.view === "home") refreshHome(); else if (state.view === "welcome") render(); });
const fmtTime = ts => { try { return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return ""; } };
const fmtWhen = ts => { if (!ts) return t("soon","قريباً"); const d = new Date(ts); return d.toDateString() === new Date().toDateString() ? fmtTime(ts) : t(`tomorrow ${fmtTime(ts)}`,`غداً ${fmtTime(ts)}`); };
function quotaText(){ const A = AUTH.state; if (A.admin) return t("Admin · unlimited discussions","المشرف · نقاشات غير محدودة"); if (A.premium && A.unlimited) return t("Premium · unlimited discussions and AI calls","بريميوم · نقاشات وطلبات ذكاء اصطناعي غير محدودة"); return A.left ? t(`${A.left} of ${A.limit} new discussions left in this 24-hour window`,`تبقّى ${A.left} من ${A.limit} نقاشات جديدة في فترة الـ24 ساعة`) : t(`24-hour limit reached · next discussion at ${fmtWhen(A.resetAt)}`,`اكتمل حدّ الـ24 ساعة · النقاش التالي ${fmtWhen(A.resetAt)}`); }
function quotaHTML(){ return signedSite() ? `<span class="quota ${AUTH.state.left ? "" : "out"}" data-quota>${ic("spark")}<span>${quotaText()}</span></span>` : `<span data-quota hidden></span>`; }
if (AUTH) window.addEventListener("council-auth", () => {
  state.me.name = signedSite() ? (AUTH.state.name || "") : "";
  document.querySelectorAll("[data-quota]").forEach(el => { el.outerHTML = quotaHTML(); });
  document.querySelectorAll("[data-quota-text]").forEach(el => { el.textContent = signedSite() ? quotaText() : ""; });
  if (state.view === "welcome" || state.menu === "me") render();
  else refreshChrome();
});
function authErr(e){
  const c = e?.code;
  return c === "invalid_email" ? t("Please enter a valid email address.","أدخل بريداً إلكترونياً صحيحاً.")
    : c === "invalid_name" ? t("Enter your name to create an account.","أدخل اسمك لإنشاء حساب.")
    : c === "password_too_short" ? t("Use a password with 10–128 characters.","استخدم كلمة مرور من 10 إلى 128 حرفاً.")
    : c === "invalid_password" ? t("That password isn't correct.","كلمة المرور غير صحيحة.")
    : c === "account_exists" ? t("An account with this email already exists. Sign in instead.","يوجد حساب بهذا البريد بالفعل. سجّل الدخول بدلاً من ذلك.")
    : c === "invalid_credentials" ? t("Email or password is incorrect.","البريد الإلكتروني أو كلمة المرور غير صحيحة.")
    : c === "invalid_recovery_code" ? t("That recovery code is invalid or has already been used.","رمز الاستعادة غير صالح أو سبق استخدامه.")
    : c === "signin_required" ? t("Sign in again to manage recovery codes.","سجّل الدخول مجدداً لإدارة رموز الاستعادة.")
    : c === "rate_limited" ? t("Too many attempts. Try again in 15 minutes.","محاولات كثيرة. حاول مجدداً بعد 15 دقيقة.")
    : c === "storage_unavailable" ? t("Accounts are temporarily unavailable. Your browser discussions are unchanged; try again shortly.","الحسابات غير متاحة مؤقتاً. نقاشات متصفحك لم تتغير؛ حاول بعد قليل.")
    : t("Something went wrong. Please try again.","حدث خطأ. حاول مجدداً.");
}

/* ---------- toasts ---------- */
function toast(text, { kind = "", action = null, ms = 3200 } = {}){
  const box = $("#toasts"); const el = document.createElement("div");
  el.className = "toast " + kind; el.setAttribute("role", kind === "err" ? "alert" : "status");
  const span = document.createElement("span"); span.textContent = text; el.append(span);
  if (action){ const b = document.createElement("button"); b.textContent = action.label; b.onclick = () => { action.fn(); el.remove(); }; el.append(b); }
  box.append(el); setTimeout(() => el.remove(), action ? Math.max(ms, 6000) : ms);
}
const notify = (text, kind = "") => { if (text) toast(text, { kind, ms: 5200 }); };

/* ---------- storage: this browser + Claude account ---------- */
const sync = { status: "local", timers: {}, chains: {}, tooBig: false };
const userCol = () => !authOn() && db && state.me.id ? db.collection("data/users/" + state.me.id) : null;
function setSync(st){ sync.status = st; document.querySelectorAll("[data-sync]").forEach(el => el.outerHTML = syncHTML()); }
function syncHTML(){
  const st = !userCol() ? "local" : sync.status;
  const label = st === "local" ? t("Saved in this browser","محفوظ في هذا المتصفح") : st === "saving" ? t("Saving…","جارٍ الحفظ…") : st === "error" ? t("Not synced — saved in this browser","لم تتم المزامنة — محفوظ في المتصفح") : t("Synced to your account","متزامن مع حسابك");
  return `<span class="sync ${st === "saved" ? "" : st === "saving" ? "saving" : "local"}" data-sync><i></i>${label}</span>`;
}
function persistLocal(){ const ok = store.set(HISTORY_KEY, state.history); if (!ok) toast(t("This browser couldn't save. Your changes have not been confirmed.","تعذّر الحفظ في هذا المتصفح. لم يتم تأكيد التغييرات."), { kind: "err" }); return !!ok; }
function save(sx){
  const s = sx || state.s; if (!s || (s.example && !s.touched)) return;
  s.updatedAt = Date.now();
  state.history = [s, ...state.history.filter(h => h.id !== s.id)];
  persistLocal(); queueRemote(s);
}
function queueRemote(s){
  const col = userCol(); if (!col) return;
  clearTimeout(sync.timers[s.id]); setSync("saving");
  sync.timers[s.id] = setTimeout(() => {
    const body = { kind: "discussion", updatedAt: s.updatedAt, data: JSON.parse(JSON.stringify(s)) };
    if (JSON.stringify(body).length > 250000){ setSync("error"); if (!sync.tooBig){ sync.tooBig = true; toast(t("This discussion is too long to sync. It stays saved in this browser.","هذا النقاش أطول من أن يُزامَن، وسيبقى محفوظاً في هذا المتصفح.")); } return; }
    sync.chains[s.id] = (sync.chains[s.id] || Promise.resolve()).then(() => col.doc("d-" + s.id).set(body)).then(() => setSync("saved")).catch(() => setSync("error"));
  }, 700);
}
async function loadRemote(){
  const col = userCol(); if (!col) return;
  try {
    const [pd, snap] = await Promise.all([
      col.doc("prefs").get().catch(() => null),
      col.where("kind", "==", "discussion").orderBy("updatedAt", "desc").limit(1000).get()
    ]);
    const rp = pd?.exists ? pd.data() : null;
    if (rp){ if (rp.onboarded) prefs.onboarded = true; if ((prefs.theme || "system") === "system" && (rp.theme === "light" || rp.theme === "dark")){ prefs.theme = rp.theme; applyTheme(); } if (!prefs.lang && rp.lang) { prefs.lang = rp.lang; state.lang = rp.lang; state.draft.dlang = rp.lang; } }
    // records from the account store come back read-only: work on editable copies
    const remote = snap.docs.map(d => { try { return JSON.parse(JSON.stringify(d.data()?.data || null)); } catch { return null; } }).filter(s => s && s.id && Array.isArray(s.seats));
    const byId = new Map(remote.map(s => [s.id, s]));
    for (const loc of state.history){ const r = byId.get(loc.id); if (!r || (loc.updatedAt || 0) > (r.updatedAt || 0)){ byId.set(loc.id, loc); queueRemote(loc); } }
    state.history = [...byId.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    persistLocal(); sync.status = "saved";
  } catch { sync.status = "error"; }
}
function savePrefs(){
  prefs.lang = state.lang; store.set(PREF_KEY, prefs);
  const col = userCol(); if (col) col.doc("prefs").set({ lang: prefs.lang, onboarded: !!prefs.onboarded, theme: prefs.theme || "system" }).catch(() => {});
}
function setTheme(v){
  prefs.theme = v === "light" || v === "dark" ? v : "system";
  ROOT_EL.classList.add("theme-anim"); applyTheme(); savePrefs();
  clearTimeout(setTheme.tm); setTheme.tm = setTimeout(() => ROOT_EL.classList.remove("theme-anim"), 400);
}
function themeSeg(){
  const opts = [["system", "device", t("Match system","حسب الجهاز")], ["light", "sun", t("Light","فاتح")], ["dark", "moon", t("Dark","داكن")]];
  return `<div class="seg icons" role="group" aria-label="${t("Theme","المظهر")}">${opts.map(([v, i, l]) => `<button data-act="set-theme" data-v="${v}" aria-pressed="${(prefs.theme || "system") === v}" aria-label="${l}" title="${l}">${ic(i)}</button>`).join("")}</div>`;
}

/* ---------- live / demo state ---------- */
let resolveSample; const samplePromise = new Promise(r => { resolveSample = r; });
function computeMode(){ return sample ? (state.demoChosen || state.liveBlocked ? "demo" : "live") : (state.capsSettled ? "demo" : "checking"); }
function syncMode(){ const before = state.mode; state.mode = computeMode(); if (before !== state.mode) refreshChrome(); }
async function ensureMode(){ if (state.mode === "checking"){ await Promise.race([samplePromise, new Promise(r => setTimeout(r, 11000))]); state.capsSettled = true; syncMode(); } }
function refreshChrome(){
  if (state.view === "splash" || state.view === "welcome"){ if (state.view === "welcome") render(); return; }
  const top = $(".top"); if (top) top.outerHTML = headerHTML();
  document.querySelectorAll("[data-banner]").forEach(el => el.outerHTML = bannerHTML());
  const acc = $(".accept small"); if (acc) acc.textContent = state.mode === "live" ? t("Each contribution uses your Claude usage — you'll be asked to allow this once.","كل مساهمة تستخدم رصيدك في Claude، وسيُطلب إذنك مرة واحدة.") : t("Demo mode: answers are scripted examples.","الوضع التوضيحي: الإجابات أمثلة مكتوبة مسبقاً.");
  if (state.view === "discuss" && !state.busy){ const box = $("#msgs"); const y = box?.scrollTop; const hm = $("#hostmsg"); const had = document.activeElement === hm; render(); const b2 = $("#msgs"); if (b2 && y != null) b2.scrollTop = y; if (had) $("#hostmsg")?.focus(); }
}
function bannerHTML(){
  const s = state.s; const demoMsgs = s ? s.messages.filter(m => m.type === "persona" && m.demo).length : 0;
  if (state.mode === "live"){
    if (demoMsgs && state.view === "discuss" && !state.busy) return `<div class="banner ok" data-banner>${ic("bolt")}<span>${t(`Live AI is on. ${demoMsgs} earlier ${demoMsgs === 1 ? "answer is" : "answers are"} still scripted.`,`الذكاء المباشر مفعّل. ما زالت ${demoMsgs} من الإجابات السابقة مكتوبة مسبقاً.`)}</span><button class="btn sm primary" data-act="rewrite-all">${t("Rewrite them live","أعد كتابتها مباشرة")}</button></div>`;
    return `<span data-banner hidden></span>`;
  }
  if (state.mode === "checking") return `<div class="banner" data-banner><span class="spinner" style="width:16px;height:16px;border-width:2px"></span><span>${t("Connecting to Claude…","جارٍ الاتصال بـ Claude…")}</span></div>`;
  const why = !sample ? "unavailable" : state.demoChosen ? "chosen" : state.liveBlocked;
  const msg = why === "chosen" ? t("Demo mode — answers are scripted examples, not live AI.","الوضع التوضيحي — الإجابات أمثلة مكتوبة مسبقاً وليست ذكاءً مباشراً.")
    : why === "declined" ? t("Claude access wasn't allowed for this page, so answers are scripted. Reload the page and choose Allow when Claude asks.","لم يُسمح لهذه الصفحة باستخدام Claude، لذا الإجابات مكتوبة مسبقاً. أعد تحميل الصفحة واختر «سماح» عندما يسألك Claude.")
    : why === "disabled" ? t("Live AI is turned off for this account or organization, so answers are scripted examples.","الذكاء المباشر غير مفعّل لهذا الحساب أو المؤسسة، لذا الإجابات أمثلة مكتوبة.")
    : t("Live AI isn't reachable in this view, so answers are scripted. Open this page inside Claude (claude.ai or the Claude app), not in a separate tab.","الذكاء المباشر غير متاح في هذا العرض، لذا الإجابات مكتوبة مسبقاً. افتح الصفحة داخل Claude (claude.ai أو تطبيق Claude) وليس في تبويب منفصل.");
  return `<div class="banner warn" data-banner>${ic("alert")}<span>${msg}</span>${why === "chosen" && sample ? `<button class="btn sm primary" data-act="go-live">${ic("bolt")}${t("Switch to live AI","انتقل إلى الذكاء المباشر")}</button>` : ""}</div>`;
}

/* ---------- header ---------- */
function meAvatar(size = 30){ return signedSite() ? `<span class="gen account-initials">${esc(initials({ name: AUTH.state.name || "" }) || "?")}</span>` : state.me.avatarUrl ? `<img src="${esc(state.me.avatarUrl)}" alt="" width="${size}" height="${size}">` : `<span class="gen">${ic("user")}</span>`; }
function headerHTML(){
  const inSession = state.s && state.view !== "home";
  return `<header class="top"><div class="top-in">
    <button class="brandmark" dir="ltr" data-act="home" aria-label="${t("The Council — home","The Council — الرئيسية")}">${mark({ state: "idle" })}<b lang="en">The Council</b></button>
    <div class="top-actions">
      <span class="mode ${state.mode}" role="status" title="${state.mode === "live" ? t("Answers are written live by Claude on your account","تُكتب الإجابات مباشرة بواسطة Claude على حسابك") : t("Scripted examples, not live AI","أمثلة مكتوبة مسبقاً وليست ذكاءً اصطناعياً مباشراً")}"><i></i><span class="mode-text">${state.mode === "live" ? t("Live AI","ذكاء مباشر") : state.mode === "demo" ? t("Demo mode","وضع توضيحي") : t("Connecting…","جارٍ الاتصال…")}</span></span>
      ${state.view !== "home" ? `<button class="btn" data-act="new">${ic("plus")}<span class="new-text">${t("New discussion","نقاش جديد")}</span></button>` : ""}
      ${signedSite() ? `<button class="btn ghost" data-shares-open aria-label="${t("Shared snapshots","اللقطات المشتركة")}">${ic("shield")}<span class="new-text">${t("Shares","المشاركات")}</span></button>` : ""}
      ${passwordSiteAccount() ? `<button class="btn ghost" data-friends-open aria-label="${t("Friends and requests","الأصدقاء وطلبات الصداقة")}">${ic("user")}<span class="new-text">${t("Friends","الأصدقاء")}</span></button>` : ""}
      ${inSession ? `<div class="menu-wrap"><button class="btn ghost icon-only" data-act="menu" data-menu="session" aria-haspopup="menu" aria-expanded="${state.menu === "session"}" aria-label="${t("Discussion options","خيارات النقاش")}">${ic("more")}</button>
        ${state.menu === "session" ? `<div class="menu" role="menu">
          <button role="menuitem" data-act="dl-transcript">${ic("dl")}${t("Download transcript","تنزيل النص")}</button>
          <button role="menuitem" data-act="copy-transcript">${ic("copy")}${t("Copy transcript","نسخ النص")}</button>
          <hr><button role="menuitem" class="danger" data-act="delete" data-id="${state.s.id}">${ic("trash")}${t("Delete this discussion","حذف هذا النقاش")}</button></div>` : ""}</div>` : ""}
      <button class="btn ghost icon-only theme-btn" data-act="toggle-theme" aria-label="${effTheme() === "dark" ? t("Switch to light theme","التبديل إلى المظهر الفاتح") : t("Switch to dark theme","التبديل إلى المظهر الداكن")}" title="${effTheme() === "dark" ? t("Light theme","المظهر الفاتح") : t("Dark theme","المظهر الداكن")}">${ic(effTheme() === "dark" ? "sun" : "moon")}</button>
      <div class="menu-wrap"><button class="me-btn" data-act="menu" data-menu="me" aria-haspopup="menu" aria-expanded="${state.menu === "me"}" aria-label="${t("Account and settings","الحساب والإعدادات")}">${meAvatar()}${ic("down")}</button>
        ${state.menu === "me" ? `<div class="menu" role="menu">
           ${authOn() ? `<div class="menu-head"><b>${esc(signedSite() ? AUTH.state.name || "" : t("Guest","ضيف"))}</b><small dir="ltr">${esc(signedSite() ? AUTH.state.email || "" : "")}</small><small data-quota-text>${signedSite() ? quotaText() : t("Not signed in · browser-only discussions","غير مسجّل · النقاشات في هذا المتصفح فقط")}</small></div>` : `<div class="menu-head"><b>${esc(state.me.name || t("Guest","ضيف"))}</b><small>${state.me.id ? t("Signed in with Claude","مسجّل الدخول عبر Claude") : t("Not signed in · this browser only","غير مسجّل · هذا المتصفح فقط")}</small></div>`}
          <div class="menu-row">${ic(effTheme() === "dark" ? "moon" : "sun")}<span>${t("Theme","المظهر")}</span>${themeSeg()}</div>
          <button role="menuitem" data-act="lang">${ic("globe")}${t("Language","اللغة")}<span class="aside">${ar() ? "العربية" : "English"}</span></button>
           ${signedSite() ? `<button role="menuitem" data-shares-open>${ic("shield")}${t("Shared snapshots","اللقطات المشتركة")}</button>` : ""}
          <button role="menuitem" data-act="toggle-mode" ${sample ? "" : "disabled"}>${ic("bolt")}${t("Answers","الإجابات")}<span class="aside">${state.mode === "live" ? t("Live AI","مباشرة") : t("Demo","توضيحية")}</span></button>
          <button role="menuitem" data-act="keys">${ic("keys")}${t("Keyboard shortcuts","اختصارات لوحة المفاتيح")}<span class="aside">?</span></button>
          <button role="menuitem" data-act="example">${ic("book")}${t("See a finished example","شاهد مثالاً مكتملاً")}</button>
          <button role="menuitem" data-act="welcome">${ic("eye")}${t("Welcome screen","شاشة الترحيب")}</button>
          <button role="menuitem" data-act="about">${ic("shield")}${t("Privacy & AI transparency","الخصوصية والشفافية")}</button>
           ${passwordSiteAccount() ? `<button role="menuitem" data-act="go-recovery">${ic("keys")}${t("Recovery codes","رموز الاستعادة")}</button>` : ""}
           ${passwordSiteAccount() ? `<button role="menuitem" data-friends-open>${ic("user")}${t("Friends and requests","الأصدقاء وطلبات الصداقة")}</button>` : ""}
           <hr>${authOn() && !signedSite() ? `<button role="menuitem" data-act="go-signin">${ic("login")}${t("Create account or sign in","إنشاء حساب أو تسجيل الدخول")}</button>` : !authOn() && !state.me.id && prefs.signedOut && userCap ? `<button role="menuitem" data-act="sign-in">${ic("login")}${t("Sign in with Claude","تسجيل الدخول عبر Claude")}</button>` : `<button role="menuitem" class="danger" data-act="sign-out-ask">${ic("logout")}${t("Sign out","تسجيل الخروج")}</button>`}</div>` : ""}</div>
    </div></div></header>`;
}
function creditHTML(){ return `<div class="credit" aria-label="${t("By Emad Hanna","من عماد حنا")}"><span>${t("By","من")}</span>${logoImg(24)}</div>`; }
function footHTML(){
  return `<footer class="foot">${mark({ state: "idle" })}<span><b class="foot-name" lang="en" dir="ltr">The Council</b> · ${t("AI-simulated perspectives, you host the conversation.","منظورات محاكاة بالذكاء الاصطناعي، وأنت تدير الحوار.")}</span>
    ${creditHTML()}</footer>`;
}
function steps(now){
  const names = [t("Question","السؤال"), t("Council","المجلس"), t("Discussion","النقاش"), t("Decision brief","الخلاصة")];
  return `<ol class="steps" aria-label="${t("Progress","التقدم")}">${names.map((n, i) => `<li class="${i < now ? "done" : i === now ? "now" : ""}" ${i === now ? 'aria-current="step"' : ""}><span>${i < now ? "✓" : i + 1}</span>${n}</li>`).join("")}</ol>`;
}

/* ---------- splash + welcome ---------- */
function splashHTML(){ return `<div class="splash">${mark({ state: "draw idle", label: "The Council" })}<p>${t("Preparing your table…","نُجهّز طاولتك…")}</p>${creditHTML()}</div>`; }
function siteGateHTML(){
  const A = AUTH.state, st = state.auth;
  const err = st.err ? `<p class="auth-err" role="alert">${ic("alert")}<span>${esc(st.err)}</span></p>` : "";
  const spin = st.busy ? `<span class="spinner sm"></span>` : "";
  if (A.signedIn) return `
      <div><span class="eyebrow">${t("Signed in","تم تسجيل الدخول")}</span>
        <h2 id="gate-h" style="margin-top:10px">${t(`Welcome, ${esc(A.name || "")}.`,`أهلاً ${esc(A.name || "")}.`)}</h2>
        <p class="lead">${t(`Each day you can start ${A.limit} new discussions. Continuing a discussion you've already started is always free.`,`يمكنك كل يوم بدء ${A.limit} نقاشات جديدة، ومتابعة أي نقاش بدأته مجانية دائماً.`)}</p></div>
      <div class="who-card"><span class="gen">${ic("user")}</span><div><b>${esc(A.name || "")}</b><small dir="ltr">${esc(A.email || "")}</small><small data-quota-text>${quotaText()}</small></div><span class="check">${ic("check")}</span></div>
      <div class="gate-actions">
        ${passwordSiteAccount() ? `<button class="btn block" data-act="go-recovery">${ic("keys")}${t("Manage recovery codes","إدارة رموز الاستعادة")}</button>` : ""}
        <button class="btn primary lg block" data-act="enter" data-autofocus>${t("Enter The Council","ادخل المجلس")}${ic("right","flip")}</button>
        <p class="alt" style="margin:0">${t("Not you?","لست أنت؟")} <button class="link" data-act="sign-out-ask">${t("Sign out","تسجيل الخروج")}</button></p>
      </div>`;
  if (A.unavailable) return `<div><span class="eyebrow">${t("Accounts unavailable","الحسابات غير متاحة")}</span><h2 id="gate-h" style="margin-top:10px">${t("We can't reach account sign-in.","تعذّر الاتصال بتسجيل الدخول.")}</h2><p class="lead">${t("Live discussions require an account. Your browser-only discussions and backups remain available; please try again shortly.","تتطلب النقاشات المباشرة حساباً. نقاشات المتصفح والنسخ الاحتياطية متاحة كما هي؛ حاول مجدداً بعد قليل.")}</p></div><div class="gate-actions"><button class="btn primary lg block" data-act="auth-refresh">${t("Try again","حاول مجدداً")}</button><button class="btn block" data-act="enter-demo">${t("Continue in demo mode","المتابعة في الوضع التوضيحي")}</button></div>`;
  const signup = st.step === "signup", recover = st.step === "recover";
  return `
      <div><span class="eyebrow">${signup ? t("Create account","إنشاء حساب") : recover ? t("Password recovery","استعادة كلمة المرور") : t("Sign in","تسجيل الدخول")}</span>
        <h2 id="gate-h" style="margin-top:10px">${signup ? t("Make room for a better question.","امنح سؤالك مساحةً للتفكير.") : recover ? t("Use an offline recovery code.","استخدم رمز استعادة دون اتصال.") : t("Return to your table.","عُد إلى طاولتك.")}</h2>
        <p class="lead">${t(`Every account can start ${A.limit} new discussions in a rolling 24 hours. Continuing one you've started is always free.`,`يمكن لكل حساب بدء ${A.limit} نقاشات جديدة خلال 24 ساعة متحركة. متابعة نقاش بدأته مجانية دائماً.`)}</p></div>
      <form id="auth-form" class="auth-form" novalidate>
        ${signup ? `<label class="label" for="auth-name">${t("Your name","اسمك")}</label><input class="input" id="auth-name" type="text" autocomplete="name" maxlength="80" value="${esc(st.name || "")}" data-autofocus ${st.busy ? "disabled" : ""}>` : ""}
        <label class="label" for="auth-email">${t("Email address","البريد الإلكتروني")}</label>
        <input class="input" id="auth-email" type="email" inputmode="email" autocomplete="email" dir="ltr" placeholder="name@example.com" value="${esc(st.email || "")}" ${signup ? "" : "data-autofocus"} ${st.busy ? "disabled" : ""}>
        ${recover ? `<label class="label" for="auth-recovery-code">${t("Recovery code","رمز الاستعادة")}</label><input class="input" id="auth-recovery-code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="39" dir="ltr" ${st.busy ? "disabled" : ""}>` : ""}
        <label class="label" for="auth-password">${recover ? t("New password","كلمة المرور الجديدة") : t("Password","كلمة المرور")}</label>
        <input class="input" id="auth-password" type="password" autocomplete="${signup || recover ? "new-password" : "current-password"}" minlength="10" maxlength="128" dir="ltr" ${st.busy ? "disabled" : ""}>
        ${signup || recover ? `<label class="label" for="auth-confirm">${t("Confirm password","تأكيد كلمة المرور")}</label><input class="input" id="auth-confirm" type="password" autocomplete="new-password" minlength="10" maxlength="128" dir="ltr" ${st.busy ? "disabled" : ""}>` : ""}
        ${err}
        <button class="btn primary lg block" type="submit" ${st.busy ? "disabled" : ""}>${spin}${signup ? t("Create account","إنشاء حساب") : recover ? t("Reset password","إعادة تعيين كلمة المرور") : t("Sign in","تسجيل الدخول")}${st.busy ? "" : ic("right","flip")}</button>
        ${!signup && !recover ? `<p class="alt center" style="margin:0"><button type="button" class="link" data-act="auth-mode" data-v="recover">${t("Forgot your password?","هل نسيت كلمة المرور؟")}</button></p>` : ""}
        <p class="alt center" style="margin:0">${recover ? t("Remembered your password?","تذكرت كلمة المرور؟") : signup ? t("Already have an account?","لديك حساب بالفعل؟") : t("New to The Council?","جديد في المجلس؟")} <button type="button" class="link" data-act="auth-mode" data-v="${signup || recover ? "signin" : "signup"}">${signup || recover ? t("Sign in","تسجيل الدخول") : t("Create an account","أنشئ حساباً")}</button></p>
      </form>
      <p class="alt center auth-policy" style="margin:0">${recover ? t("Recovery works only with a code you saved earlier. No email is sent.","لا تعمل الاستعادة إلا باستخدام رمز حفظته مسبقاً. لن يُرسل أي بريد.") : signup ? t("No email verification. Save recovery codes while signed in if you want offline password recovery.","لا يوجد تحقق عبر البريد. احفظ رموز الاستعادة أثناء تسجيل الدخول إذا أردت استعادة كلمة المرور دون اتصال.") : t("No email verification. Recovery requires an offline code generated while signed in.","لا يوجد تحقق عبر البريد. تتطلب الاستعادة رمزاً دون اتصال أنشأته أثناء تسجيل الدخول.")}</p>
      <p class="alt center" style="margin:0">${t("Just looking around?","تتصفح فقط؟")} <button class="link" data-act="enter-demo">${t("Try the demo","جرّب العرض التوضيحي")}</button> ${t("— scripted answers, no sign-in.","— إجابات مكتوبة مسبقاً دون تسجيل.")}</p>`;
}
async function submitSiteAuth(){
  const st = state.auth; if (st.busy) return;
  st.name = ($("#auth-name")?.value || st.name || "").trim();
  st.email = ($("#auth-email")?.value || st.email || "").trim();
  const password = $("#auth-password")?.value || "";
  const confirm = $("#auth-confirm")?.value || "";
  const recoveryCode = $("#auth-recovery-code")?.value || "";
  st.password = password; st.confirm = confirm;
  st.err = "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(st.email)) st.err = authErr({ code: "invalid_email" });
  else if (st.step === "signup" && (!st.name || st.name.length > 80)) st.err = authErr({ code: "invalid_name" });
  else if (password.length < 10) st.err = authErr({ code: "password_too_short" });
  else if (password.length > 128) st.err = t("Passwords may be at most 128 characters.","يجب ألا تتجاوز كلمة المرور 128 حرفاً.");
  else if ((st.step === "signup" || st.step === "recover") && password !== confirm) st.err = t("Passwords don't match.","كلمتا المرور غير متطابقتين.");
  else if (st.step === "recover" && !recoveryCode.trim()) st.err = t("Enter a recovery code you saved earlier.","أدخل رمز استعادة حفظته مسبقاً.");
  if (st.err){ render(); return; }
  st.busy = true; render();
  try {
    if (st.step === "signup") await AUTH.signup(st.name, st.email, password);
    else if (st.step === "recover"){
      await AUTH.resetPassword(st.email, recoveryCode.trim(), password);
      state.auth = { step: "signin", email: st.email, name: "", password: "", confirm: "", busy: false, err: "" };
      toast(t("Password reset. Sign in with your new password.","تمت إعادة تعيين كلمة المرور. سجّل الدخول بكلمة المرور الجديدة."));
      render(); return;
    } else await AUTH.signIn(st.email, password);
    state.me.name = AUTH.state.name || st.name;
    state.auth = { step: "signin", email: "", name: "", password: "", confirm: "", busy: false, err: "" };
    toast(t(`Welcome, ${AUTH.state.name || st.name}.`,`أهلاً ${AUTH.state.name || st.name}.`));
    enter(false);
  } catch (e){ st.busy = false; st.password = ""; st.confirm = ""; st.err = authErr(e); render(); }
}
async function generateRecoveryCodes(){
  if (state.recoveryBusy || !passwordSiteAccount()) return;
  state.recoveryBusy = true; renderLayer();
  try {
    const codes = await AUTH.generateRecoveryCodes();
    if (state.modal?.kind === "recovery") state.recoveryCodes = codes;
  } catch (e){ if (state.modal?.kind === "recovery") notify(authErr(e), "err"); }
  finally { state.recoveryBusy = false; if (state.modal?.kind === "recovery") renderLayer(); }
}
function gotoSignin(msg){
  stopAll(); state.modal = null; state.menu = ""; state.picking = false;
  state.auth = { step: "signin", email: state.auth.email || "", name: state.auth.name || "", password: "", confirm: "", busy: false, err: "" };
  state.view = "welcome"; render(); window.scrollTo(0, 0);
  if (msg) toast(msg);
}
function authBlocked(e){
  stopAll(); state.picking = false;
  if (e?.code === "signin_required"){ gotoSignin(t("Your sign-in has expired. Please sign in again.","انتهت صلاحية الدخول. سجّل الدخول مجدداً.")); return; }
  state.view = "home"; render(); state.modal = { kind: "quota" }; renderLayer();
}
if (typeof codeCopy === "function"){ const _cc = codeCopy; codeCopy = code => code === "quota_exceeded" ? t("You've used today's new discussions. You can keep going in discussions you've already started.","استخدمت نقاشات اليوم الجديدة. يمكنك متابعة النقاشات التي بدأتها.") : code === "signin_required" ? t("Your sign-in has expired. Sign in again to continue.","انتهت صلاحية الدخول. سجّل الدخول مجدداً للمتابعة.") : _cc(code); }
function welcomeHTML(){
  const nm = firstName(); const signed = !!state.me.id;
  return `<div class="welcome view">
    <section class="chamber">
      ${mark({ state: "draw idle", cls: "hero-mark", label: "The Council" })}
      <div><span class="eyebrow brand-eyebrow" lang="en" dir="ltr" style="color:#F08A63">The Council</span>
      <h1 style="margin-top:12px">${t("Ask. Debate. <em>Decide.</em>","اسأل. ناقش. <em>قرّر.</em>")}</h1></div>
      <ol class="how">
        <li><div><b>${t("Ask a real question","اطرح سؤالاً حقيقياً")}</b><span>${t("A decision, a dilemma, or an idea you want to test.","قراراً أو معضلة أو فكرة تريد اختبارها.")}</span></div></li>
        <li><div><b>${t("Meet your council","تعرّف على مجلسك")}</b><span>${t("Two to five contrasting minds, chosen for your question.","من عقلين إلى خمسة عقول متباينة، مختارة لسؤالك.")}</span></div></li>
        <li><div><b>${t("Host the conversation","أدِر الحوار")}</b><span>${t("Steer, challenge, pin what matters, and leave with a decision brief.","وجّه، واعترض، وثبّت المهم، واخرج بخلاصة جاهزة للقرار.")}</span></div></li>
      </ol>
      ${welcomeNamesHTML()}
    </section>
    <section class="gate" aria-labelledby="gate-h">
      <div class="gate-top">${themeSeg()}<div class="seg" role="group" aria-label="${t("Language","اللغة")}"><button data-act="set-lang" data-v="en" aria-pressed="${!ar()}" lang="en">English</button><button data-act="set-lang" data-v="ar" aria-pressed="${ar()}" lang="ar">العربية</button></div></div>
${authOn() ? siteGateHTML() : `      <div><span class="eyebrow">${signed ? t("Signed in with Claude","تم تسجيل الدخول عبر Claude") : t("Welcome","أهلاً بك")}</span>
        <h2 id="gate-h" style="margin-top:10px">${nm ? t(`Welcome, ${esc(nm)}.`,`أهلاً ${esc(nm)}.`) : t("Welcome to The Council.","أهلاً بك في المجلس.")}</h2>
        <p class="lead">${signed ? t("No new account or password. Your Claude account keeps your discussions with you on every device.","لا حاجة لحساب جديد أو كلمة مرور. حسابك في Claude يحفظ نقاشاتك معك على كل أجهزتك.") : t("You're viewing as a guest. Discussions will be saved in this browser only.","أنت تتصفح كضيف، وستُحفظ نقاشاتك في هذا المتصفح فقط.")}</p></div>
      <div class="who-card">${state.me.avatarUrl ? `<img src="${esc(state.me.avatarUrl)}" alt="">` : `<span class="gen">${ic("user")}</span>`}
        <div><b>${esc(state.me.name || t("Guest","ضيف"))}</b><small>${signed ? t("Discussions sync to your account","النقاشات تتزامن مع حسابك") : t("Saved on this device","محفوظ على هذا الجهاز")}</small></div>
        ${signed ? `<span class="check">${ic("check")}</span>` : ""}</div>
      <div class="gate-actions">
        ${!signed && prefs.signedOut && userCap ? `<button class="btn lg block" data-act="sign-in">${ic("login")}${t("Sign in with Claude","تسجيل الدخول عبر Claude")}</button>` : ""}
        <button class="btn primary lg block" data-act="enter" data-autofocus>${nm ? t(`Continue as ${esc(nm)}`,`المتابعة باسم ${esc(nm)}`) : t("Enter The Council","ادخل المجلس")}${ic("right","flip")}</button>
        <p class="alt" style="margin:0">${sample || state.mode === "checking" ? t("Just looking around?","تتصفح فقط؟") + ` <button class="link" data-act="enter-demo">${t("Try the demo","جرّب العرض التوضيحي")}</button> ` + t("— scripted answers, no Claude usage.","— إجابات مكتوبة مسبقاً دون استخدام رصيد Claude.") : t("Live AI isn't available in this view, so answers will be scripted examples.","الذكاء المباشر غير متاح هنا، لذا ستكون الإجابات أمثلة مكتوبة.")}</p>
      </div>
`}
      <p class="fine">${ic("shield")}<span>${t("Perspectives are AI simulations inspired by public ideas. Real people have not taken part in or endorsed any discussion.","المنظورات محاكاة بالذكاء الاصطناعي مستوحاة من أفكار عامة، ولم يشارك أشخاص حقيقيون أو يؤيدوا أي نقاش.")} <button class="link" data-act="about">${t("Learn more","اعرف المزيد")}</button></span></p>
      ${creditHTML()}
    </section></div>`;
}

/* ---------- home ---------- */
function greeting(){ const h = new Date().getHours(); const nm = firstName(); const g = h < 5 ? t("Good evening","مساء الخير") : h < 12 ? t("Good morning","صباح الخير") : h < 18 ? t("Good afternoon","مساء الخير") : t("Good evening","مساء الخير"); return nm ? `${g}, ${esc(nm)}` : g; }
function topicLabel(k){ const c = D.categories.find(c => c[0] === k); return c ? (ar() ? c[2] : c[1]) : ""; }
function stack(s){ return `<span class="stack">${seatPeople(s).slice(0, 5).map((p, i) => `<span class="av xs c${i}" title="${esc(nameOf(p))}">${esc(initials(p).slice(0, 1))}</span>`).join("")}</span>`; }
function progressOf(h){ const n = h.seats.length || 1; const c = h.messages.filter(m => m.type === "persona" && m.text).length; return { c, total: h.rounds * n }; }
/* ---------- featured / most seated ---------- */
const FEATURED_IDS = ["RT-0014","RT-0095","RT-0166","RT-0265","RT-0086"]; // Steve Jobs, Immanuel Kant, Ibn Khaldun, Mother Teresa, Socrates
function topSeated(){
  const st = window.COUNCIL_STATS && window.COUNCIL_STATS.state;
  if (st && st.total >= 50 && Array.isArray(st.top)){ const list = st.top.filter(x => PERSONAS.some(p => p.id === x.id)).slice(0, 5); if (list.length === 5) return { real: true, list }; }
  return { real: false, list: FEATURED_IDS.filter(id => BY_ID.has(id) && !BY_ID.get(id).retired).map(id => ({ id })) };
}
const domainName = p => ar() ? (DOMAIN_AR[p.domain] || p.domain) : p.domain;
function featuredHTML(){
  const { real, list } = topSeated(); if (!list.length) return "";
  const pre = state.draft.preseat;
  return `<section class="featured" aria-labelledby="feat-h">
    <div class="feat-head"><h2 id="feat-h">${real ? t("Most seated this month","الأكثر جلوساً هذا الشهر") : t("Featured at The Council","ضيوف مميزون في المجلس")}</h2><span class="muted">${real ? t("Chosen most often by hosts","الأكثر اختياراً من المضيفين") : t("Bring a great mind to your table","ادعُ عقلاً عظيماً إلى طاولتك")}</span></div>
    <ul class="feat-list">${list.map((x, i) => { const p = BY_ID.get(x.id); const on = pre === p.id; return `<li class="feat ${on ? "on" : ""}">
      <span class="av c${i}">${esc(initials(p))}</span>
      <div class="feat-txt"><b>${esc(nameOf(p))}</b><small>${esc(domainName(p))}${real && x.count ? ` · ${t(`seated at ${x.count} tables`,`جلس إلى ${x.count} طاولة`)}` : ""}</small>${ar() ? "" : `<span class="feat-tag" dir="auto">${esc(p.tagline)}</span>`}</div>
      <button class="btn sm ${on ? "primary" : ""}" data-act="feature-seat" data-id="${p.id}" aria-pressed="${on}">${on ? ic("check") + t("Seat reserved","المقعد محجوز") : ic("plus") + t("Bring to my table", fem(p) ? "ادعُها إلى طاولتي" : "ادعُه إلى طاولتي")}</button></li>`; }).join("")}</ul>
  </section>`;
}
function featuredRowHTML(){
  const { real, list } = topSeated(); if (!list.length) return "";
  const pre = state.draft.preseat;
  // the Claude version has no shared data, so it previews the strip; the website switches to real rankings automatically
  const title = real || !window.COUNCIL_STATS ? t("Most seated this month","الأكثر جلوساً هذا الشهر") : t("Featured this month","ضيوف هذا الشهر");
  return `<div class="feat-row" role="group" aria-label="${title}">
    <span class="feat-row-label">${ic("spark")}${title}</span>
    <div class="feat-chips">${list.map((x, i) => { const p = BY_ID.get(x.id); const on = pre === p.id; return `<button class="feat-chip ${on ? "on" : ""}" data-act="feature-seat" data-id="${p.id}" aria-pressed="${on}" title="${on ? t("Seat reserved — tap to cancel","المقعد محجوز — اضغط للإلغاء") : t("Bring to my table","ادعُه إلى طاولتي")}${ar() ? "" : " · " + esc(p.tagline)}"><span class="av xs c${i}">${on ? ic("check") : esc(initials(p))}</span><span class="fc-txt"><b>${esc(nameOf(p))}</b><small>${real && x.count ? t(`${x.count} tables`,`${x.count} طاولة`) : esc(domainName(p))}</small></span></button>`; }).join("")}</div>
  </div>`;
}
function welcomeNamesHTML(){
  const { list } = topSeated();
  return `<div class="seen-at"><span>${t("At the table lately","على الطاولة مؤخراً")}</span><div>${list.map(x => `<b>${esc(nameOf(BY_ID.get(x.id)))}</b>`).join("")}</div></div>`;
}
function setupHTML(d){
  const md = MODES.find(m => m.id === d.mode) || MODES[0];
  const COUNTS = [[2, t("A focused duel","مواجهة مركّزة")], [3, t("Quick and balanced","سريعة ومتوازنة")], [4, t("Rich but brisk","غنية ومختصرة")], [5, t("The full table — recommended","الطاولة الكاملة — موصى بها")]];
  const LANGS = [["en", "English", t("Members speak in English","يتحدث الأعضاء بالإنجليزية")], ["ar", "العربية", t("Members speak in Arabic","يتحدث الأعضاء بالعربية")]];
  const dd = (key, icon, label, value, sub, items, cls = "") => `<div class="menu-wrap dd ${cls}">
    <button class="pick-btn" data-act="menu" data-menu="${key}" aria-haspopup="listbox" aria-expanded="${state.menu === key}">
      <span class="pick-ic">${ic(icon)}</span><span class="pick-txt"><small>${label}</small><b>${value}</b>${sub ? `<em>${sub}</em>` : ""}</span>${ic("down", "pick-chev")}</button>
    ${state.menu === key ? `<div class="menu dd-menu" role="listbox" aria-label="${label}">${items}</div>` : ""}</div>`;
  const modeItems = MODES.map(m => `<button role="option" aria-selected="${d.mode === m.id}" data-act="mode" data-v="${m.id}">${ic(m.icon)}<span class="opt-txt"><b>${esc(modeName(m))}</b><small>${esc(modeDesc(m))}</small></span></button>`).join("");
  const countItems = COUNTS.map(([n, l]) => `<button role="option" aria-selected="${d.count === n}" data-act="count" data-n="${n}"><span class="opt-num">${n}</span><span class="opt-txt"><b>${n} ${t("members","أعضاء")}</b><small>${l}</small></span></button>`).join("");
  const langItems = LANGS.map(([v, n, l]) => `<button role="option" aria-selected="${d.dlang === v}" data-act="dlang" data-v="${v}">${ic("globe")}<span class="opt-txt"><b lang="${v}">${n}</b><small>${l}</small></span></button>`).join("");
  return `<div class="setup">
    ${d.preseat && BY_ID.has(d.preseat) ? `<div class="preseat">${ic("user")}<span>${t("Reserved seat:","مقعد محجوز:")} <b>${esc(nameOf(BY_ID.get(d.preseat)))}</b></span><button class="btn ghost icon-only sm" data-act="clear-preseat" aria-label="${t("Remove reserved seat","إلغاء المقعد المحجوز")}">${ic("x")}</button></div>` : ""}
    <div class="setup-head"><span class="label">${t("Set up your session","جهّز جلستك")}</span><span class="setup-hint">${t("Change anything — sensible defaults are already set","غيّر ما تشاء — الإعدادات الافتراضية جاهزة")}</span></div>
    <div class="setup-grid">
      ${dd("sel-mode", md.icon, t("Session type","نوع الجلسة"), esc(modeName(md)), esc(modeDesc(md)), modeItems, "wide")}
      ${dd("sel-count", "user", t("Council size","عدد الأعضاء"), `${d.count} ${t("members","أعضاء")}`, "", countItems)}
      ${dd("sel-lang", "globe", t("Language","اللغة"), d.dlang === "ar" ? "العربية" : "English", "", langItems, "end")}
    </div>
    <div class="field ctx-field"><label class="label" for="ctx">${t("Context or constraints","السياق أو القيود")} <span class="opt-tag">${t("optional","اختياري")}</span></label>
      <textarea class="ta" id="ctx" rows="2" maxlength="1200" dir="auto" placeholder="${esc(t("Who is affected? What matters most? What have you already tried?","من المتأثر؟ ما الأهم؟ ماذا جرّبت؟"))}">${esc(d.context)}</textarea></div>
  </div>`;
}
function homeHTML(){
  const d = state.draft; const ideas = dailyQuestions(d.topic);
  const hq = state.histQ.trim().toLowerCase();
  const hist = state.history.filter(h => !hq || h.question.toLowerCase().includes(hq)); const detected = inferTopic(d.question);
  const resume = hist.find(h => h.stage === "discuss" && !h.synthesis);
  const ok = d.question.trim().length >= 8;
  return `<div class="view">
  ${bannerHTML()}
  <p class="greet">${state.me.avatarUrl ? `<img src="${esc(state.me.avatarUrl)}" alt="">` : ""}${greeting()}</p>
  <div class="home">
    <section class="ask" aria-labelledby="ask-h">
      <h1 id="ask-h">${t("What should <em>the council</em> think through?","ما الذي تريد أن <em>يفكر فيه</em> المجلس؟")}</h1>
      <p class="lede">${t("Ask a real question. We seat the right mix of minds — you host, steer and decide.","اطرح سؤالاً حقيقياً، ونُجلس لك مزيجاً مناسباً من العقول، وأنت تدير وتوجّه وتقرر.")}</p>
      ${featuredRowHTML()}
      <div class="qbox">
        <label class="sr" for="q">${t("Your question","سؤالك")}</label>
        <textarea id="q" maxlength="600" dir="auto" placeholder="${esc(t("e.g. Should our 20-person consultancy use AI agents to draft proposals this year?","مثال: هل ينبغي لشركتنا الاستشارية الصغيرة استخدام وكلاء الذكاء الاصطناعي لكتابة العروض هذا العام؟"))}">${esc(d.question)}</textarea>
        <div class="qbox-foot">
          <label class="topic-pill">${t("Topic","الموضوع")}<select id="topic-sel" aria-label="${t("Topic","الموضوع")}"><option value="">${t("Auto","تلقائي")}${detected && !d.topic ? " · " + esc(topicLabel(detected)) : ""}</option>${opt(D.categories).map(([v, l]) => `<option value="${v}" ${d.topic === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
          <span class="counter" id="qcount">${d.question.length}/600</span>
        </div>
      </div>
      ${setupHTML(d)}
      <div class="ask-cta">
        <button class="btn primary lg" data-act="assemble" id="assemble-btn" ${ok ? "" : "disabled"}>${ic("spark")}${t("Assemble my council","كوّن مجلسي")}${ic("right","flip")}</button>
        ${quotaHTML()}
        <small id="assemble-hint">${ok ? `<kbd>Ctrl</kbd> + <kbd>Enter</kbd> · ${t("you can change every seat next","يمكنك تغيير أي مقعد لاحقاً")}` : t("Write a question of at least a few words.","اكتب سؤالاً من بضع كلمات على الأقل.")}</small>
      </div>
      <div class="ideas">
        <div class="ideas-head"><h2>${t("Five questions for today","خمسة أسئلة لليوم")}</h2><span class="muted" style="font-size:13px">${t("A new mix every day","مجموعة جديدة كل يوم")}</span></div>
        <div class="topics" role="group" aria-label="${t("Filter by topic","تصفية حسب الموضوع")}">
          <button class="chip" data-act="topic" data-v="" aria-pressed="${!d.topic}">${t("All","الكل")}</button>
          ${opt(D.categories).map(([v, l]) => `<button class="chip" data-act="topic" data-v="${v}" aria-pressed="${d.topic === v}">${esc(l)}</button>`).join("")}
        </div>
        <ul class="idea-list">${ideas.map(q => `<li><button data-act="idea" data-q="${esc(ar() ? q[1] : q[0])}" data-cat="${q[2]}" aria-pressed="${d.question.trim() === (ar() ? q[1] : q[0])}"><span>${esc(ar() ? q[1] : q[0])}</span><em class="use">${d.question.trim() === (ar() ? q[1] : q[0]) ? t("In your box","في مربع السؤال") : t("Use this","استخدمه")}</em>${ic("right","flip")}</button></li>`).join("")}</ul>
      </div>
    </section>
    <aside class="side" aria-label="${t("Your discussions","نقاشاتك")}">
      ${resume ? (() => { const p = progressOf(resume); return `<div class="resume"><span class="eyebrow">${t("Pick up where you left off","أكمل من حيث توقفت")}</span><h3 dir="auto">${esc(resume.question)}</h3>
        <div class="meta">${stack(resume)}<span>${p.c} / ${p.total} ${t("contributions","مساهمة")}</span></div><div class="bar"><i style="width:${Math.min(100, p.c / p.total * 100)}%"></i></div>
        <button class="btn primary" data-act="open" data-id="${resume.id}">${t("Continue discussion","تابع النقاش")}${ic("right","flip")}</button></div>`; })() : ""}
      <div class="side-head"><h2>${t("Your discussions","نقاشاتك")}</h2>${syncHTML()}</div>
      <div class="backup-tools">
        <div class="backup-actions"><button class="btn sm" data-act="backup-export">${ic("dl")}${t("Download backup","تنزيل نسخة احتياطية")}</button><button class="btn sm" data-act="backup-open">${ic("device")}${t("Restore backup","استعادة نسخة احتياطية")}</button></div>
        <small>${t("Your backup stays in this browser unless you choose where to save or restore it. It contains discussion data only, never account tokens or secrets.","تبقى النسخة الاحتياطية في هذا المتصفح ما لم تختر مكاناً لتنزيلها أو استعادتها. تحتوي على بيانات النقاشات فقط، ولا تتضمن رموز الحساب أو الأسرار.")}</small>
      </div>
      ${state.history.length > 4 ? `<div class="hist-search">${ic("search")}<label class="sr" for="hist-q">${t("Search discussions","ابحث في النقاشات")}</label><input class="input" id="hist-q" value="${esc(state.histQ)}" placeholder="${esc(t("Search your discussions…","ابحث في نقاشاتك…"))}"></div>` : ""}
      ${hist.length ? `<ul class="hist">${hist.map(h => {
        const p = progressOf(h);
        const stage = h.synthesis ? `<span class="tag live">${t("Brief ready","الخلاصة جاهزة")}</span>` : h.stage === "discuss" ? `<span>${p.c}/${p.total} ${t("contributions","مساهمة")}</span>` : `<span class="tag">${t("Draft table","طاولة مسودة")}</span>`;
        return `<li><button class="open" data-act="open" data-id="${h.id}"><b dir="auto">${esc(h.question)}</b><span class="meta">${stack(h)}<span class="tag">${esc(modeName(modeOf(h)))}</span><span>${new Date(h.updatedAt).toLocaleDateString(ar() ? "ar-JO" : "en-GB", { day: "numeric", month: "short" })}</span>${stage}</span></button><button class="del" data-act="delete" data-id="${h.id}" aria-label="${t("Delete","حذف")}: ${esc(h.question)}">${ic("trash")}</button></li>`;
      }).join("")}</ul>` : (state.history.length ? `<div class="empty"><span>${t("No discussions match that search.","لا توجد نقاشات مطابقة.")}</span></div>` : `<div class="empty">${mark({ state: "idle" })}<span>${t("Your discussions will appear here — ready to continue exactly where you left them.","ستظهر نقاشاتك هنا، جاهزة لتكملها من حيث توقفت.")}</span><button class="btn sm" data-act="example">${ic("eye")}${t("See a finished example","شاهد مثالاً مكتملاً (بالإنجليزية)")}</button></div>`)}
      <div class="honesty">${ic("shield")}<span>${t("Perspectives are AI simulations inspired by public ideas. No real person has taken part or endorsed them. Check important facts.","المنظورات محاكاة بالذكاء الاصطناعي مستوحاة من أفكار عامة، دون مشاركة أو تأييد من أشخاص حقيقيين. تحقّق من الحقائق المهمة.")} <button class="link" data-act="about">${t("Learn more","اعرف المزيد")}</button></span></div>
    </aside>
  </div></div>`;
}

/* ---------- assemble ---------- */
function seatPositions(n){ const start = n === 2 ? 180 : -90; return Array.from({ length: n }, (_, i) => { const a = (start + i * 360 / n) * Math.PI / 180; return { x: 50 + 40 * Math.cos(a), y: 50 + 40 * Math.sin(a) }; }); }
function tableHTML(s){
  const n = s.seats.length || s.count; const pos = seatPositions(n); const ps = seatPeople(s);
  return `<div class="stage" role="group" aria-label="${t(`Table with ${n} seats`,`طاولة بـ ${n} مقاعد`)}">
    <div class="disc"><div>${mark({ state: state.picking ? "seating" : "idle" })}<small>${state.picking ? t("Seating your council…","نُجلس مجلسك…") : t(`${n} minds · you host`,`${n} عقول · وأنت المضيف`)}</small></div></div>
    ${state.picking || !ps.length ? pos.map((p, i) => `<span class="seat empty-seat" style="left:${p.x}%;top:${p.y}%"><span class="av">${i + 1}</span></span>`).join("") :
      ps.map((p, i) => `<button class="seat ${state.justSeated ? "arrive" : ""}" data-i="${i}" style="left:${pos[i].x}%;top:${pos[i].y}%;animation-delay:${i * 130}ms" data-act="seat" aria-label="${t("Chair","المقعد")} ${i + 1}: ${esc(nameOf(p))}. ${t("Change","تغيير")}">
      <span class="av c${i}">${esc(initials(p))}<span class="n">${i + 1}</span></span><b>${esc(nameOf(p))}</b><small>${esc(domainOf(p))}</small></button>`).join("")}
  </div>`;
}
const SEG = (key, rows, val) => `<div class="seg" role="group">${rows.map(([v, l]) => `<button data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${String(val) === String(v)}">${esc(l)}</button>`).join("")}</div>`;
function assembleHTML(){
  const s = state.s; const ps = seatPeople(s);
  const right = state.picking ? `<section class="card picks"><div class="picks-head"><h2>${state.pickMode === "ai" ? t("Claude is choosing your council","يختار Claude مجلسك") : t("Choosing perspectives","جارٍ اختيار المنظورات")}</h2><span class="spinner"></span></div>
      <p class="muted" style="margin:0 0 14px;font-size:14px">${t("Reading your question and matching it against 250 perspectives. Usually 10–30 seconds.","نقرأ سؤالك ونطابقه مع 250 منظوراً. يستغرق ذلك عادةً من 10 إلى 30 ثانية.")}</p>
      <div class="loading-picks">${Array.from({ length: s.count }, () => '<div class="skel"></div>').join("")}</div>
      <div style="margin-top:14px"><button class="btn" data-act="quickpicks">${ic("bolt")}${t("Skip — use quick picks","تخطَّ — استخدم الاختيار السريع")}</button></div></section>` :
    `<section class="card picks" aria-labelledby="picks-h">
      <div class="picks-head"><h2 id="picks-h">${t("Your council","مجلسك")}</h2><span class="tag ${s.pickedBy === "ai" ? "live" : ""}">${s.pickedBy === "ai" ? t("Chosen by Claude for this question","اختارها Claude لهذا السؤال") : t("Quick picks","اختيار سريع")}</span></div>
      <p class="muted" style="margin:0 0 8px;font-size:14px">${t("Chosen for relevance first, then contrast. Keep it, or change any chair.","اختيرت للصلة أولاً ثم للتنوع. احتفظ بها أو غيّر أي مقعد.")}</p>
      ${ps.map((p, i) => { const r = s.reasons?.[p.id] || {}; return `<div class="pick" data-i="${i}">
        <span class="av sm c${i}">${esc(initials(p))}</span>
        <div class="pick-main"><div class="nm"><b>${esc(nameOf(p))}</b><span class="tag">${esc(typeLabel(p))}</span></div>
          <p class="why">${esc(r.why || p.tagline)}</p>
          <details><summary>${ic("down")}${t("Starting position & background","الموقف المبدئي والخلفية")}</summary>${r.position ? `<p><strong>${t("Starting position","الموقف المبدئي")}:</strong> ${esc(r.position)}</p>` : ""}<p>${esc(p.brief)}</p></details>
        </div>
        <button class="btn sm" data-act="seat" data-i="${i}">${t("Change","تغيير")}</button></div>`; }).join("")}
      <div class="runs"><h3>${t("How the discussion runs","كيف يسير النقاش")}</h3>
        <div class="row"><span class="label">${t("Style","الأسلوب")}</span>${SEG("style", STYLES.map(r => [r[0], ar() ? r[2] : (r[0] === "socratic" ? "Socratic" : r[1])]), s.style)}</div>
        <div class="row"><span class="label">${t("Answer length","طول الإجابة")}</span>${SEG("length", opt(LENGTHS), s.length)}</div>
        <div class="row"><span class="label">${t("Rounds","الجولات")}</span>${SEG("rounds", [["2","2"],["3","3"],["4","4"],["5","5"]], s.rounds)}</div>
        <div class="row"><span class="label">${t("Faith perspectives","المنظورات الدينية")}</span>${SEG("religious", [["respectful", t("Respectful","باحترام")], ["academic", t("Academic","أكاديمي")]], s.religious)}</div>
      </div>
      <div class="accept"><button class="btn primary lg block" data-act="accept">${t("Open the discussion","افتح النقاش")}${ic("right","flip")}</button>
      <small>${state.mode === "live" ? t("Each contribution uses your Claude usage — you'll be asked to allow this once.","كل مساهمة تستخدم رصيدك في Claude، وسيُطلب إذنك مرة واحدة.") : t("Demo mode: answers are scripted examples.","الوضع التوضيحي: الإجابات أمثلة مكتوبة مسبقاً.")}</small></div>
    </section>`;
  return `<div class="view">${steps(1)}${bannerHTML()}
  <div class="page-head"><div><button class="back" data-act="edit-q">${ic("left","flip")}${t("Edit question","تعديل السؤال")}</button><h1 dir="auto">${esc(s.question)}</h1></div></div>
  <div class="asm"><section class="card table-card">${tableHTML(s)}<p class="table-note">${state.picking ? "&nbsp;" : t("Select a chair to change who sits there.","اختر مقعداً لتغيير من يجلس عليه.")}</p></section>${right}</div></div>`;
}

/* ---------- discussion ---------- */
function nextSeat(s){
  if (s.nextPid && s.seats.includes(s.nextPid)) return s.seats.indexOf(s.nextPid);
  const lastHost = [...s.messages].reverse().find(m => m.type === "host");
  if (lastHost && lastHost.to && lastHost.to !== "all"){
    const answered = s.messages.slice(s.messages.indexOf(lastHost) + 1).some(m => m.type === "persona" && m.pid === lastHost.to);
    const i = s.seats.indexOf(lastHost.to); if (!answered && i >= 0) return i;
  }
  return s.turn % s.seats.length;
}
function orderOf(s, i){ const n = s.seats.length; const nxt = nextSeat(s); const pos = (i - nxt + n) % n; return pos === 0 ? t("next","التالي") : "#" + (pos + 1); }
function convoStatus(s){
  const ps = seatPeople(s);
  if (state.busy && state.busyKind === "synth") return t("Writing the decision brief…","يكتب الخلاصة…");
  if (state.busy && state.speaking >= 0) return `${esc(nameOf(ps[state.speaking]))} ${t("is thinking…","يفكّر…")}`;
  const c = s.messages.filter(m => m.type === "persona" && m.text).length;
  return c ? `${t("Round","الجولة")} ${Math.min(s.rounds, Math.floor(s.turn / ps.length) + 1)} ${t("of","من")} ${s.rounds}` : t("Ready when you are","جاهز عندما تكون جاهزاً");
}
function discussHTML(){
  const s = state.s; const ps = seatPeople(s);
  const contributions = s.messages.filter(m => m.type === "persona" && m.text).length;
  const total = s.rounds * ps.length; const nxt = nextSeat(s);
  const canSynth = contributions >= ps.length; const done = s.turn >= total;
  const pins = (s.pins || []).map(id => s.messages.find(m => m.id === id)).filter(Boolean);
  let lastRound = 0;
  const msgs = s.messages.map(m => { let sep = ""; if (m.type === "persona" && m.round && m.round !== lastRound){ if (lastRound) sep = `<div class="round-sep">${t("Round","الجولة")} ${m.round}</div>`; lastRound = m.round; } return sep + msgHTML(s, m); }).join("");
  return `<div class="view">${steps(s.synthesis ? 3 : 2)}
  ${AUTH ? `<section class="discussion-actions" aria-label="${t("Join or share this discussion","انضم إلى هذا النقاش أو شاركه")}">
    <p class="discussion-personal-label">${t("Personal discussion","نقاش شخصي")}</p>
    <div class="discussion-actions-buttons">
      <button class="btn primary" type="button" data-discussion-invite ${state.busy ? "disabled" : ""}>${ic("user")}${t("Invite a friend","ادعُ صديقاً")}</button>
      <button class="btn" type="button" data-discussion-open-room data-discussion-id="${esc(s.id)}" hidden>${ic("user")}${t("Open shared council","افتح المجلس المشترك")}</button>
      <button class="btn" type="button" data-shares-create ${state.busy ? "disabled" : ""}>${ic("shield")}${t("Share a personal copy","شارك نسخة من النقاش الشخصي")}</button>
    </div>
    <p class="discussion-actions-note">${t("Inviting starts a separate shared council. Personal edits and shared contributions do not sync automatically. This Share button copies only your personal discussion.","تفتح الدعوة مجلساً مشتركاً منفصلاً. لا تتزامن التعديلات الشخصية والمساهمات المشتركة تلقائياً. يشارك هذا الزر نسخة من نقاشك الشخصي فقط.")}</p>
    ${state.busy ? `<p class="discussion-actions-status" role="status">${t("Please wait until the council has finished its current turn before inviting or sharing.","يرجى الانتظار حتى ينتهي المجلس من دوره الحالي قبل الدعوة أو المشاركة.")}</p>` : ""}
    ${!signedSite() ? `<p class="discussion-actions-status">${t("Sign in is required to invite a friend or share this discussion. Choose an option to continue to sign in.","يلزم تسجيل الدخول لدعوة صديق أو مشاركة هذا النقاش. اختر أحد الخيارين للمتابعة إلى تسجيل الدخول.")}</p>` : ""}
  </section>` : ""}
  <div class="dl">
    <aside class="card side-panel ${state.panelOpen ? "panel-open" : "panel-collapsed"}" aria-label="${t("Discussion details","تفاصيل النقاش")}">
      <button class="panel-toggle" data-act="toggle-panel" aria-expanded="${state.panelOpen}" aria-controls="panel-details">
        <span>${ic("user")}${t("Council & discussion details","المجلس وتفاصيل النقاش")}</span>${ic("down")}
      </button>
      <div class="panel-details" id="panel-details">
      <div><span class="eyebrow">${esc(modeName(modeOf(s)))} · ${t("your question","سؤالك")}</span>${s.example ? ` <span class="tag demo">${t("Example","مثال")}</span>` : ""}<h1 style="margin-top:6px" dir="auto">${esc(s.question)}</h1></div>
      <div class="people-head"><span class="label">${t("Speaking order","ترتيب الحديث")}</span><span class="fine">${t("Tap a member for options","اضغط على عضو للخيارات")}</span></div>
      <ul class="people">${ps.map((p, i) => `<li class="menu-wrap"><button class="${i === nxt && !state.busy ? "next" : ""}" data-act="menu" data-menu="p${i}" aria-haspopup="menu" aria-expanded="${state.menu === "p" + i}">
        <span class="av sm c${i}">${esc(initials(p))}</span><span class="pn"><b>${esc(nameOf(p))}</b><small>${state.speaking === i ? t("Thinking…","يفكّر…") : i === nxt ? t("Speaks next","يتحدث تالياً") : esc(domainOf(p))}</small></span>${state.speaking === i ? '<span class="speaking-dot"></span>' : `<span class="order">${orderOf(s, i)}</span>`}</button>
        ${state.menu === "p" + i ? `<div class="menu person-menu" role="menu">
          <button role="menuitem" data-act="speak" data-i="${i}" ${state.busy ? "disabled" : ""}>${ic("play","flip")}${t("Let them speak now","دعه يتحدث الآن")}</button>
          <button role="menuitem" data-act="queue" data-i="${i}" ${i === nxt ? "disabled" : ""}>${ic("steer")}${t("Make them next","اجعله التالي")}</button>
          <button role="menuitem" data-act="ask" data-id="${p.id}">${ic("at")}${t("Ask them a question","اطرح عليه سؤالاً")}</button>
          <hr><button role="menuitem" data-act="seat" data-i="${i}">${ic("user")}${t("View profile or replace","الملف الشخصي أو الاستبدال")}</button>
          ${ps.length > 2 ? `<button role="menuitem" class="danger" data-act="remove-seat" data-i="${i}" ${state.busy ? "disabled" : ""}>${ic("x")}${t("Remove from the table","أخرجه من الطاولة")}</button>` : ""}
        </div>` : ""}</li>`).join("")}</ul>
      ${ps.length < 5 && !state.busy ? `<button class="btn sm ghost add-member" data-act="add-seat">${ic("plus")}${t("Add an AI member","أضف عضواً من الذكاء الاصطناعي")}</button>` : ""}
      <details class="ctx-edit" ${s.context ? "" : ""}><summary>${ic("book")}${s.context ? t("Context (edit)","السياق (تعديل)") : t("Add context the council should know","أضف سياقاً يجب أن يعرفه المجلس")}</summary>
        <textarea class="ta" id="ctx-live" dir="auto" maxlength="1200" placeholder="${esc(t("Budget, deadline, who is affected, what you've tried…","الميزانية، الموعد، من المتأثر، ماذا جرّبت…"))}">${esc(s.context || "")}</textarea><small class="fine">${t("Used from the next contribution onward.","يُستخدم ابتداءً من المساهمة التالية.")}</small></details>
      <div class="desk-only"><div class="progress-row"><span>${t("Progress","التقدم")}</span><span>${contributions} / ${total}</span></div><div class="bar"><i style="width:${Math.min(100, contributions / total * 100)}%"></i></div></div>
      ${pins.length ? `<div class="pins"><h3>${ic("pin")}${t("Key points","نقاط أساسية")}</h3><ul>${pins.map(m => `<li><span><b>${esc(nameOf(personaOf(s, m.pid)))}:</b> ${esc(m.text.replace(/[*_#]/g, "").slice(0, 110))}${m.text.length > 110 ? "…" : ""}</span><button data-act="pin" data-id="${m.id}" aria-label="${t("Unpin","إلغاء التثبيت")}">${ic("x")}</button></li>`).join("")}</ul></div>` : ""}
      <button class="btn block ${done && !s.synthesis ? "primary" : ""}" data-act="synth" ${canSynth && !state.busy ? "" : "disabled"}>${ic("spark")}${s.synthesis ? t("Open decision brief","افتح الخلاصة") : t("Create decision brief","أنشئ الخلاصة")}</button>
      ${!canSynth ? `<p class="fine">${t(`Unlocks after the first full round (${contributions}/${ps.length}).`,`تُتاح بعد اكتمال الجولة الأولى (${contributions}/${ps.length}).`)}</p>` : ""}
      <div class="desk-only">${syncHTML()}</div>
      <p class="fine">${t("AI-simulated perspectives. No real participant or endorsement. Verify factual claims.","منظورات محاكاة بالذكاء الاصطناعي، دون مشاركة أو تأييد من أشخاص حقيقيين. تحقّق من الحقائق.")}</p>
      </div>
    </aside>
    <section class="card convo" aria-labelledby="convo-h">
      <div class="convo-head" id="convo-head">${convoHeadInner(s)}</div>
      ${bannerHTML()}
      <div class="msgs" id="msgs" aria-live="polite">${msgs}
        ${done && !s.synthesis && !state.busy ? `<div class="nudge">${ic("spark")}<span>${t(`The council has finished ${s.rounds} rounds. Ready for the decision brief?`,`أنهى المجلس ${s.rounds} جولات. هل أنت جاهز للخلاصة؟`)}</span><button class="btn" data-act="add-round">${ic("plus")}${t("One more round","جولة إضافية")}</button><button class="btn primary" data-act="synth">${t("Create decision brief","أنشئ الخلاصة")}</button></div>` : ""}
      </div>
      <button class="jump" data-act="jump" hidden>${ic("down")}${t("Latest","الأحدث")}</button>
      <div class="composer">
        <div class="comp-row">
          ${state.busy ? `<button class="btn primary" data-act="stop">${ic("stop")}${state.autoplay ? t("Stop autoplay","إيقاف التشغيل") : t("Stop","إيقاف")}</button>` :
            `<div class="split menu-wrap"><button class="btn primary" data-act="next">${ic("play","flip")}<span>${t("Next","التالي")}:</span> <span class="next-name">${esc(nameOf(ps[nxt]))}</span></button><button class="btn primary caret" data-act="menu" data-menu="pick" aria-haspopup="menu" aria-expanded="${state.menu === "pick"}" aria-label="${t("Choose who speaks next","اختر من يتحدث تالياً")}">${ic("down")}</button>
              ${state.menu === "pick" ? `<div class="menu pick-menu" role="menu"><div class="menu-head"><b>${t("Who speaks now?","من يتحدث الآن؟")}</b><small>${t("The usual order continues afterwards","يستمر الترتيب المعتاد بعدها")}</small></div>${ps.map((p, i) => `<button role="menuitem" data-act="speak" data-i="${i}"><span class="av xs c${i}">${esc(initials(p).slice(0, 1))}</span>${esc(nameOf(p))}${i === nxt ? `<span class="aside">${t("next in order","التالي بالترتيب")}</span>` : ""}</button>`).join("")}</div>` : ""}</div>
             <button class="btn" data-act="autoplay" ${done ? "disabled" : ""} aria-label="${t("Play the round","شغّل الجولة")}" title="${t("Play the round (P)","شغّل الجولة (P)")}">${ic("play","flip")}<span class="lbl">${t("Play the round","شغّل الجولة")}</span></button>`}
          <div class="menu-wrap"><button class="btn" data-act="menu" data-menu="steer" aria-haspopup="menu" aria-expanded="${state.menu === "steer"}" aria-label="${t("Steer","توجيه")}" ${state.busy ? "disabled" : ""}>${ic("steer")}<span class="lbl">${t("Steer","توجيه")}</span>${ic("down")}</button>
            ${state.menu === "steer" ? `<div class="menu steer-menu" role="menu">${STEERS.map((q, i) => `<button role="menuitem" data-act="steer" data-i="${i}">${esc(ar() ? q[1] : q[0])}</button>`).join("")}</div>` : ""}</div>
        </div>
        ${s.suggest && !state.busy ? `<button class="suggest" data-act="use-suggest" title="${t("Suggested next question — tap to edit, then send","سؤال مقترح — اضغط لتعديله ثم أرسله")}">${ic("bulb")}<span>${esc(s.suggest)}</span>${ic("copy")}</button>` : ""}
        <div class="inputbar">
          <div class="menu-wrap to-wrap"><button class="to-chip ${s.to && s.to !== "all" ? "set" : ""}" data-act="menu" data-menu="to" aria-haspopup="listbox" aria-expanded="${state.menu === "to"}">${s.to && s.to !== "all" ? `<span class="av xs c${Math.max(0, s.seats.indexOf(s.to))}">${esc(initials(personaOf(s, s.to) || { name: "?" }).slice(0, 1))}</span>${esc(nameOf(personaOf(s, s.to)))}` : `${ic("at")}<span class="lbl">${t("Whole table","كل الطاولة")}</span>`}${ic("down")}</button>
            ${state.menu === "to" ? `<div class="menu to-menu" role="listbox">${toMenuItems(s, "")}</div>` : ""}</div>
          <div class="ta-wrap"><label class="sr" for="hostmsg">${t("Your message","رسالتك")}</label>
          <textarea id="hostmsg" rows="1" dir="auto" title="${t("Enter to send & get an AI response · @ to address someone · N next speaker · B brief · ? all shortcuts","Enter للإرسال والحصول على ردّ من الذكاء الاصطناعي · @ لمخاطبة أحدهم · N المتحدث التالي · B الخلاصة · ? كل الاختصارات")}" placeholder="${esc(t("Your view — or @ someone…","رأيك — أو @ لمخاطبة أحدهم…"))}">${esc(s.hostDraft || "")}</textarea>
          <div class="mention" id="mention" hidden></div></div>
          <button class="send" data-act="send" aria-label="${t("Send & get response","أرسل واحصل على رد")}" title="${t("Send & get response","أرسل واحصل على رد")}" ${state.busy ? "disabled" : ""}>${ic("send","flip")}</button>
        </div>
        <small class="host-response-hint">${t("Sending your message automatically asks the next AI mind to respond.","إرسال رسالتك يطلب تلقائياً من عضو الذكاء الاصطناعي التالي أن يردّ.")}</small>
      </div>
    </section>
  </div></div>`;
}
function convoHeadInner(s){
  const st = state.busy && state.busyKind === "synth" ? "converge" : state.busy && state.speaking >= 0 ? "thinking" : "idle";
  const c = s.messages.filter(m => m.type === "persona" && m.text).length; const cs = consensus(s);
  return `${mark({ state: st, active: state.speaking })}<div><h2 id="convo-h">${t("The conversation","الحوار")}</h2><div class="status">${convoStatus(s)}</div></div><span class="count">${c} ${t("contributions","مساهمة")}</span>`;
}
function toMenuItems(s, q){
  const ps = seatPeople(s); q = (q || "").toLowerCase();
  const rows = [["all", `${ic("at")}<span>${t("Whole table","كل الطاولة")}</span>`], ...ps.map((p, i) => [p.id, `<span class="av xs c${i}">${esc(initials(p).slice(0, 1))}</span><span>${esc(nameOf(p))}</span>`])]
    .filter(([id]) => !q || (id !== "all" && [personaOf(s, id).name, personaOf(s, id).ar].join(" ").toLowerCase().includes(q)));
  return rows.map(([id, html], k) => `<button role="option" data-act="to" data-id="${id}" aria-selected="${(s.to || "all") === id}">${html}</button>`).join("") || `<div class="muted" style="padding:8px 12px;font-size:13px">${t("No one by that name","لا يوجد أحد بهذا الاسم")}</div>`;
}
function setTo(id){ const s = state.s; if (!s) return; s.to = id || "all"; state.menu = ""; state.mention = null; }
function stanceChip(s, m){
  if (m.stance == null) return "";
  const st = m.stance; const cls = st > 0 ? "pos" : st < 0 ? "neg" : "mid";
  const prev = [...s.messages].slice(0, s.messages.indexOf(m)).reverse().find(x => x.type === "persona" && x.pid === m.pid && x.stance != null);
  const moved = prev && prev.stance !== st;
  return `<span class="stance ${cls}" title="${esc(m.position || "")}"><i></i>${esc(STANCE_WORD(st))}${moved ? ` · ${t("changed position","غيّر موقفه")}` : ""}</span>`;
}
function msgHTML(s, m){
  if (m.type === "recap"){ const gap = m.gap; return `<div class="msg recap">${mark({ state: "idle" })}<div class="body"><div class="who"><b>${t("Chair","رئيس الجلسة")}</b><small>${t("Round","الجولة")} ${m.round}</small></div><div class="text md" dir="auto">${md(m.text)}</div>${gap && !state.busy && s.messages[s.messages.length - 1] === m ? `<div class="msg-actions" style="opacity:1"><button data-act="face-off" data-a="${gap[0]}" data-b="${gap[1]}">${ic("swap")}${t("Ask them to respond to each other","اطلب منهما الرد على بعضهما")}</button></div>` : ""}</div></div>`; }
  if (m.type === "event") return `<div class="msg event">${esc(m.text)}</div>`;
  if (m.type === "mod") return `<div class="msg mod">${mark({ state: "idle" })}<div class="body"><div class="who"><b>${t("Moderator","المُيسّر")}</b></div><div class="text md" dir="auto">${md(m.text)}</div></div></div>`;
  if (m.type === "host"){ const to = m.to && m.to !== "all" ? personaOf(s, m.to) : null; const hostName = signedSite() ? AUTH.state.name || t("You","أنت") : t("You","أنت"); return `<div class="msg host"><span class="hostav">${state.me.avatarUrl ? `<img src="${esc(state.me.avatarUrl)}" alt="">` : esc(signedSite() ? initials({ name: hostName }) : hostName)}</span><div class="body"><div class="who"><small>${esc(hostName)}${to ? t(" · to"," · إلى") + " " + esc(nameOf(to)) : t(" · to the table"," · إلى الطاولة")}</small></div><div class="text" dir="auto">${esc(m.text).replace(/\n/g, "<br>")}</div></div></div>`; }
  const p = personaOf(s, m.pid); const i = s.seats.indexOf(m.pid); const ci = i >= 0 ? i : 0;
  const pinned = (s.pins || []).includes(m.id);
  return `<div class="msg persona ${pinned ? "pinned" : ""}" id="m-${m.id}" style="--seat:var(--s${ci})"><span class="av sm c${ci}">${esc(initials(p || { name: "?" }))}</span><div class="body"><div class="who"><b>${esc(nameOf(p) || "")}</b><small>${esc(domainOf(p))}</small>${stanceChip(s, m)}${m.demo ? `<span class="tag demo">${t("Demo","توضيحي")}</span>` : ""}${m.interrupted ? `<span class="tag">${t("Interrupted","منقطع")}</span>` : ""}</div>
    <div class="text md" dir="auto">${m.text ? md(displayText(m.text)) : `<span class="thinking"><span class="typing"><i></i><i></i><i></i></span><span class="bl">${esc(state.busyLabel || t("Thinking…","يفكّر…"))}</span></span>`}</div>
    ${m.text && !(state.busy && state.speaking >= 0 && s.messages[s.messages.length - 1] === m) ? `<div class="msg-actions">
      ${m.interrupted && !state.busy ? `<button data-act="retry" data-id="${m.id}">${ic("refresh")}${t("Retry","إعادة")}</button>` : ""}
      <button data-act="reply" data-id="${m.pid}">${ic("reply","flip")}${t("Reply","رد")}</button>
      <button data-act="pin" data-id="${m.id}" aria-pressed="${pinned}">${ic("pin")}${pinned ? t("Pinned","مثبّت") : t("Pin as key point","ثبّت كنقطة أساسية")}</button>
      <button data-act="copy-msg" data-id="${m.id}" aria-label="${t("Copy","نسخ")}">${ic("copy")}</button>
      ${!state.busy && m.demo && state.mode === "live" ? `<button data-act="retry" data-id="${m.id}">${ic("bolt")}${t("Rewrite with live AI","أعد كتابتها مباشرة")}</button>` : ""}
      ${!state.busy && !m.demo && s.messages.filter(x => x.type === "persona").slice(-1)[0] === m ? `<button data-act="retry" data-id="${m.id}" aria-label="${t("Regenerate","أعد الإنشاء")}">${ic("refresh")}${t("Regenerate","أعد")}</button>` : ""}</div>` : ""}</div></div>`;
}

/* ---------- overlays ---------- */
function layerHTML(){
  const m = state.modal; if (!m) return "";
  if (m.kind === "recovery"){
    const codes = state.recoveryCodes || [];
    return `<div class="scrim" data-act="close-scrim"><div class="modal" style="width:min(560px,100%)" role="dialog" aria-modal="true" aria-labelledby="recovery-h">
      <div class="m-head">${mark({ state: "idle" })}<div><span class="eyebrow">${t("Offline account recovery","استعادة الحساب دون اتصال")}</span><h2 id="recovery-h">${t("Recovery codes","رموز الاستعادة")}</h2><p>${t("No email is used or sent.","لا يُستخدم البريد الإلكتروني ولا تُرسل أي رسائل.")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body">
        ${codes.length ? `<p class="recovery-warning">${t("Save these codes somewhere private now. Each code works once. They are shown only this time; closing this window hides them.","احفظ هذه الرموز الآن في مكان خاص. يعمل كل رمز مرة واحدة. ستُعرض هذه الرموز الآن فقط؛ سيؤدي إغلاق النافذة إلى إخفائها.")}</p><div class="recovery-code-list" dir="ltr">${codes.map(code => `<code>${esc(code)}</code>`).join("")}</div>` : `<p class="recovery-secret">${t("Generate 10 cryptographically random one-use codes and save them outside this browser. Only secure hashes are kept on the server. Generating a new set replaces any old codes.","أنشئ 10 رموز عشوائية آمنة تُستخدم مرة واحدة واحفظها خارج هذا المتصفح. تُحفظ بصمات آمنة فقط على الخادم. يؤدي إنشاء مجموعة جديدة إلى إبطال الرموز السابقة.")}</p>${state.recoveryBusy ? `<p class="alt">${t("Generating codes…","جارٍ إنشاء الرموز…")}</p>` : ""}`}
      </div><div class="m-foot">${codes.length ? `<button class="btn" data-act="recovery-copy">${ic("copy")}${t("Copy codes","نسخ الرموز")}</button>` : ""}<button class="btn ghost left" data-act="close">${t("Close","إغلاق")}</button>${codes.length ? "" : `<button class="btn primary" data-act="recovery-generate" ${state.recoveryBusy ? "disabled" : ""}>${state.recoveryBusy ? `<span class="spinner sm"></span>` : ic("keys")}${AUTH.state.recoveryCodesAvailable ? t("Replace codes","استبدال الرموز") : t("Generate codes","إنشاء الرموز")}</button>`}</div></div></div>`;
  }
  if (m.kind === "synth"){
    const s = state.s; const txt = m.text ?? s.synthesis ?? "";
    return `<div class="scrim drawer-scrim" data-act="close-scrim"><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="sy-h">
      <div class="m-head">${mark({ state: state.busy ? "converge" : "idle" })}<div><span class="eyebrow">${t("Decision brief","الخلاصة")}</span><h2 id="sy-h" dir="auto">${esc(s.question)}</h2><p>${t("AI-generated synthesis — not an endorsement by the represented figures.","خلاصة مولّدة بالذكاء الاصطناعي، وليست تأييداً من الشخصيات الممثلة.")}${s.synthDemo ? ` <span class="tag demo">${t("Demo","توضيحي")}</span>` : ""}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body">
        ${Object.keys(latestStances(s)).length ? `<section class="final-pos"><h3 class="sec">${t("Final positions","المواقف النهائية")}</h3>${meterHTML(s)}${positionsList(s)}</section>` : ""}
        <div class="md brief" id="synth-body" dir="auto">${txt ? briefHTML(s, txt) : `<span class="thinking"><span class="spinner"></span>${esc(state.busyLabel)}</span>`}</div>
        ${!state.busy && (s.followups || []).length ? `<section class="followups"><h3 class="sec">${t("Keep going","تابع التفكير")}</h3><p class="muted" style="margin:0 0 10px;font-size:13.5px">${t("Start a follow-up discussion that carries this brief as context.","ابدأ نقاشاً لاحقاً يحمل هذه الخلاصة كسياق.")}</p>${s.followups.map((f, i) => `<button class="fu" data-act="followup" data-i="${i}" dir="auto"><span>${esc(f)}</span>${ic("right","flip")}</button>`).join("")}</section>` : ""}
      </div>
      <div class="m-foot">${state.busy ? `<button class="btn" data-act="stop">${ic("stop")}${t("Stop","إيقاف")}</button>` : `
        <button class="btn ghost left" data-act="close">${ic("left","flip")}${t("Back to discussion","العودة للنقاش")}</button>
        <button class="btn" data-act="regen">${ic("refresh")}${t("Regenerate","إعادة الإنشاء")}</button>
        <button class="btn" data-act="copy-synth">${ic("copy")}${t("Copy","نسخ")}</button>
        <button class="btn primary" data-act="dl-transcript">${ic("dl")}${t("Download","تنزيل")}</button>`}</div></div></div>`;
  }
  if (m.kind === "about"){
    return `<div class="scrim" data-act="close-scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="ab-h"><div class="m-head">${mark({ state: "idle" })}<div><h2 id="ab-h">${t("About your table","عن طاولتك")}</h2><p>${t("Privacy and AI transparency","الخصوصية والشفافية بشأن الذكاء الاصطناعي")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body md">${md(ar() ? `## حسابك\nأنشئ حساباً باسمك وبريدك الإلكتروني وكلمة مرور تختارها. لا نرسل رسائل تحقق بالبريد. أثناء تسجيل الدخول، يمكنك إنشاء رموز استعادة دون اتصال وحفظها بنفسك؛ لا يمكن استعادة كلمة المرور دون رمز محفوظ مسبقاً. يتيح الحساب بدء نقاشين جديدين خلال 24 ساعة متحركة، مع متابعة نقاشاتك السابقة مجاناً. النقاشات والنسخ الاحتياطية محفوظة في هذا المتصفح، ولا تُرفع إلى حسابك.\n\n## كيف تُكتب الإجابات\nفي الوضع المباشر يكتب Claude كل مساهمة باستخدام حسابك في Claude، وسيُطلب إذنك مرة واحدة. في الوضع التوضيحي تكون الإجابات أمثلة مكتوبة مسبقاً.\n\n## المنظورات\nالشخصيات التاريخية محاكاة مستوحاة من أفكارها العامة، وليست الأشخاص الحقيقيين، ولم يؤيد أحد هذه النقاشات. تحقّق دائماً من الحقائق المهمة.` : `## Your account\nCreate an account with your name, email address, and a password you choose. We do not send verification emails. While signed in, you can generate offline recovery codes and save them yourself; a password can only be recovered with a code saved in advance. Accounts can start two new discussions in a rolling 24-hour period; continuing existing discussions is free. Discussions and backups stay in this browser and are not uploaded to your account.\n\n## How answers are written\nIn live mode, Claude writes each contribution using your Claude account — you'll be asked to allow it once. In demo mode, answers are scripted examples.\n\n## The perspectives\nHistorical figures are AI simulations inspired by their public ideas — not the real people — and none of them has endorsed these discussions. Always verify important facts.`)}</div></div></div>`;
  }
  if (m.kind === "backup"){
    return `<div class="scrim" data-act="close-scrim"><div class="modal" style="width:min(560px,100%)" role="dialog" aria-modal="true" aria-labelledby="backup-h">
      <div class="m-head">${mark({ state: "idle" })}<div><span class="eyebrow">${t("Browser-only backup","نسخة احتياطية محلية")}</span><h2 id="backup-h">${t("Restore discussions","استعادة النقاشات")}</h2><p>${t("Choose a Council JSON backup. Nothing is sent to a server.","اختر نسخة احتياطية بصيغة JSON من المجلس. لن تُرسل أي بيانات إلى خادم.")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body">
        <p class="backup-privacy" id="backup-privacy">${t("This restore happens only in this browser. It adds discussions without replacing existing ones; duplicate IDs are skipped. Your full history is kept (up to 1,000 discussions), and no auth tokens or secrets are exported or imported.","تتم الاستعادة في هذا المتصفح فقط. تُضاف النقاشات دون استبدال الموجودة، وتُتخطى المعرفات المكررة. يُحتفظ بسجلّك كاملاً (حتى ١٬٠٠٠ نقاش)، ولا تُصدّر رموز الدخول أو الأسرار ولا تُستورد.")}</p>
        <label class="field"><span class="label">${t("Backup file (.json)","ملف النسخة الاحتياطية (.json)")}</span><input class="input" id="backup-file" type="file" accept="application/json,.json" aria-describedby="backup-privacy backup-result"></label>
        <p class="backup-result" id="backup-result" role="status" aria-live="polite">${esc(state.backupResult)}</p>
      </div><div class="m-foot"><button class="btn ghost left" data-act="close">${t("Close","إغلاق")}</button><button class="btn primary" data-act="backup-import">${ic("device")}${t("Restore backup","استعادة النسخة")}</button></div>
    </div></div>`;
  }
  if (m.kind === "quota"){
    const A = AUTH?.state || {};
    return `<div class="scrim" data-act="close-scrim"><div class="modal" style="width:min(480px,100%)" role="dialog" aria-modal="true" aria-labelledby="qt-h"><div class="m-head">${mark({ state: "idle" })}<div><h2 id="qt-h">${t("That's the current 24-hour limit","اكتمل حدّ الـ24 ساعة")}</h2><p dir="ltr">${esc(A.email || "")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body"><p style="margin:0 0 10px">${t(`You've started ${A.limit} new discussions in the last 24 hours. Your next one unlocks at`,`بدأت ${A.limit} نقاشات جديدة خلال آخر 24 ساعة. يُتاح النقاش التالي`)} <b>${fmtWhen(A.resetAt)}</b>.</p><p class="muted" style="margin:0">${t("Meanwhile, you can keep going in any discussion you've already started, or try this question in demo mode.","في الأثناء، يمكنك متابعة أي نقاش بدأته، أو تجربة هذا السؤال في الوضع التوضيحي.")}</p></div>
      <div class="m-foot"><button class="btn ghost left" data-act="close">${t("OK","حسناً")}</button><button class="btn" data-act="quota-demo">${ic("play")}${t("Try in demo mode","جرّب في الوضع التوضيحي")}</button></div></div></div>`;
  }
  if (m.kind === "signout"){
    const signed = !!state.me.id; const site = signedSite(); const account = signed || site;
    return `<div class="scrim" data-act="close-scrim"><div class="modal" style="width:min(480px,100%)" role="dialog" aria-modal="true" aria-labelledby="so-h"><div class="m-head">${mark({ state: "idle" })}<div><h2 id="so-h">${t("Sign out?","تسجيل الخروج؟")}</h2><p ${site ? 'dir="ltr"' : ""}>${signed ? esc(state.me.name || "") : site ? esc(AUTH.state.email) : t("You're using The Council as a guest","أنت تستخدم المجلس كضيف")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body"><p style="margin:0">${site || !signed ? t("Your discussions stay in this browser after sign-out. Keep them, or explicitly clear this browser — for example on a shared computer.","ستبقى نقاشاتك في هذا المتصفح بعد تسجيل الخروج. احتفظ بها أو امسحها صراحةً — مثلاً على جهاز مشترك.") : t("Your discussions stay safe in your Claude account and come back when you sign in again. The copy kept in this browser will be removed.","تبقى نقاشاتك محفوظة في حسابك في Claude وتعود عند تسجيل الدخول مجدداً. ستُحذف النسخة المحفوظة في هذا المتصفح.")}</p></div>
      <div class="m-foot"><button class="btn ghost left" data-act="close">${t("Cancel","إلغاء")}</button>${account ? `<button class="btn" data-act="sign-out" data-clear="1">${ic("trash")}${t("Sign out & clear this browser","تسجيل الخروج ومسح هذا المتصفح")}</button><button class="btn primary" data-act="sign-out" data-autofocus>${ic("logout")}${t("Sign out, keep discussions","تسجيل الخروج مع الاحتفاظ بالنقاشات")}</button>` : `<button class="btn" data-act="sign-out" data-clear="1">${ic("trash")}${t("Sign out & clear","خروج ومسح")}</button><button class="btn primary" data-act="sign-out" data-autofocus>${ic("logout")}${t("Sign out, keep them","خروج مع الاحتفاظ")}</button>`}</div></div></div>`;
  }
  if (m.kind === "lib") return libHTML();
  if (m.kind === "keys"){
    const rows = [["N", t("Next speaker","المتحدث التالي")], ["1 – 5", t("Let that member speak now","دع هذا العضو يتحدث الآن")], ["P", t("Play the rest of the round","شغّل بقية الجولة")], ["B", t("Open or create the decision brief","افتح الخلاصة أو أنشئها")], ["/", t("Write to the table","اكتب إلى الطاولة")], ["@", t("Address one member","خاطب عضواً واحداً")], ["Enter", t("Send your message","أرسل رسالتك")], ["Shift + Enter", t("New line","سطر جديد")], ["Ctrl + Enter", t("Assemble the council (on the question box)","كوّن المجلس (في مربع السؤال)")], ["Esc", t("Stop / close","إيقاف / إغلاق")], ["?", t("Show this list","اعرض هذه القائمة")]];
    return `<div class="scrim" data-act="close-scrim"><div class="modal" style="width:min(520px,100%)" role="dialog" aria-modal="true" aria-labelledby="k-h"><div class="m-head">${mark({ state: "idle" })}<div><h2 id="k-h">${t("Keyboard shortcuts","اختصارات لوحة المفاتيح")}</h2><p>${t("Host the council without leaving the keyboard.","أدِر المجلس دون أن تترك لوحة المفاتيح.")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close","إغلاق")}">${ic("x")}</button></div>
      <div class="m-body"><dl class="keys">${rows.map(([k, d]) => `<div><dt>${k.split(" + ").map(x => `<kbd>${x}</kbd>`).join(" + ")}</dt><dd>${d}</dd></div>`).join("")}</dl></div></div></div>`;
  }
  return "";
}
function positionsList(s){
  const st = latestStances(s); const dis = dissenter(s);
  return `<ul class="pos-list">${seatPeople(s).map((p, i) => { const x = st[p.id]; return `<li><span class="av sm c${i}">${esc(initials(p))}</span><span class="pl"><b>${esc(nameOf(p))}</b>${dis === p.id ? ` <span class="tag dis">${t("Strongest dissent","أقوى اعتراض")}</span>` : ""}<small dir="auto">${x ? esc(x.pos || "") : t("No position stated","لم يحدد موقفاً")}</small></span>${x ? `<span class="stance ${x.v > 0 ? "pos" : x.v < 0 ? "neg" : "mid"}"><i></i>${esc(STANCE_WORD(x.v))}</span>` : ""}</li>`; }).join("")}</ul>`;
}
function briefHTML(s, txt){
  let k = 0; const checks = s.checks || {};
  return md(txt).replace(/<li>\[( |x|X)\]\s*/g, (mm, c) => { const i = k++; const on = checks[i] ?? (c.toLowerCase() === "x"); return `<li class="todo"><input type="checkbox" data-act="check" data-i="${i}" ${on ? "checked" : ""} aria-label="${t("Mark done","تم")}">`; });
}
function libFiltered(){
  const f = state.lib; const q = f.q.trim().toLowerCase();
  return PERSONAS.filter(p => !(window.COUNCIL_SKIP || []).includes(p.id)).filter(p => (!f.type || p.type === f.type) && (!f.era || p.era === f.era) && (!f.domain || p.domains.includes(f.domain)) &&
    (!q || [p.name, p.ar, p.domains.join(" "), p.subs, p.tagline, p.values, p.topics].join(" ").toLowerCase().includes(q)));
}
function pcard(p, s, pv, sug){ const at = s.seats.indexOf(p.id); return `<button class="pcard ${sug ? "sug" : ""}" data-act="lib-preview" data-id="${p.id}" aria-pressed="${pv && pv.id === p.id}"><span class="dom">${esc(domainOf(p))}</span><b>${esc(nameOf(p))}</b><small>${esc(p.tagline)}</small>${at >= 0 ? `<span class="seated">${t("At chair","في المقعد")} ${at + 1}</span>` : ""}</button>`; }
function libGridHTML(){
  const s = state.s; const f = state.lib; const list = libFiltered();
  const pv = f.custom ? null : (personaOf(s, f.preview) || personaOf(s, s.seats[f.seat]));
  const filtered = f.q || f.domain || f.type || f.era;
  let sugHTML = "";
  if (!filtered){
    const sug = quickPicks(s.question, s.topic, 12).map(x => BY_ID.get(x.id)).filter(p => p && !s.seats.includes(p.id)).slice(0, 6);
    if (sug.length) sugHTML = `<div class="lib-section"><span>${t("Suggested for this question","مقترح لهذا السؤال")}</span></div><div class="grid">${sug.map(p => pcard(p, s, pv, true)).join("")}</div>`;
  }
  return `${sugHTML}<div class="lib-section"><span>${filtered ? `${list.length} ${t("matching","نتيجة")}` : t("All perspectives","كل المنظورات")}</span><span style="display:flex;gap:4px">${filtered ? `<button class="btn ghost sm" data-act="lib-reset">${t("Reset","إعادة ضبط")}</button>` : ""}<button class="btn ghost sm" style="color:var(--green)" data-act="lib-custom">${ic("plus")}${t("Create your own","أنشئ منظورك")}</button></span></div>
    <div class="grid">${list.map(p => pcard(p, s, pv, false)).join("") || `<div class="empty" style="grid-column:1/-1">${t("No perspectives match. Try a broader search.","لا توجد نتائج. جرّب بحثاً أوسع.")}</div>`}</div>`;
}
function libHTML(){
  const s = state.s; const f = state.lib;
  const cur = personaOf(s, s.seats[f.seat]);
  const pv = f.custom ? null : (personaOf(s, f.preview) || cur || BY_ID.get(quickPicks(s.question, s.topic, 12).find(x => !s.seats.includes(x.id))?.id) || PERSONAS[0]);
  const eras = ERAS.filter(e => PERSONAS.some(p => p.era === e)); const eraAr = ERA_AR;
  const pvSeat = pv ? s.seats.indexOf(pv.id) : -1;
  return `<div class="scrim" data-act="close-scrim"><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="lib-h">
    <div class="m-head"><div><span class="eyebrow">${t("Persona library","مكتبة الشخصيات")}</span><h2 id="lib-h">${f.add ? t("Who joins the table?","من ينضم إلى الطاولة؟") : t(`Who sits in chair ${f.seat + 1}?`,`من يجلس في المقعد ${f.seat + 1}؟`)}</h2><p>${cur ? t("Currently","حالياً") + ": " + esc(nameOf(cur)) + " · " : ""}${PERSONAS.length} ${t("perspectives","منظوراً")}</p></div><button class="btn ghost icon-only x" data-act="close" aria-label="${t("Close library","إغلاق المكتبة")}">${ic("x")}</button></div>
    <div class="lib ${f.showDetail ? "show-detail" : ""}">
      <div class="lib-left">
        <div class="lib-filters">
          <div class="search">${ic("search")}<label class="sr" for="lib-q">${t("Search","بحث")}</label><input class="input" id="lib-q" data-autofocus value="${esc(f.q)}" placeholder="${esc(t("Search a name, expertise or topic…","ابحث باسم أو خبرة أو موضوع…"))}"></div>
          <label class="sr" for="lib-domain">${t("Domain","المجال")}</label><select class="select" id="lib-domain" data-lib="domain"><option value="">${t("All domains","كل المجالات")}</option>${DOMAINS.map(d => `<option value="${esc(d)}" ${f.domain === d ? "selected" : ""}>${esc(ar() ? DOMAIN_AR[d] : d)} (${PERSONAS.filter(p => p.domains.includes(d)).length})</option>`).join("")}</select>
          <label class="sr" for="lib-type">${t("Type","النوع")}</label><select class="select" id="lib-type" data-lib="type"><option value="">${t("All types","كل الأنواع")}</option><option value="Archetype" ${f.type === "Archetype" ? "selected" : ""}>${t("Professional archetypes","منظورات مهنية")}</option><option value="Historical figure" ${f.type === "Historical figure" ? "selected" : ""}>${t("Historical figures","شخصيات تاريخية")}</option><option value="Living public figure" ${f.type === "Living public figure" ? "selected" : ""}>${t("Living public figures","شخصيات معاصرة")}</option></select>
          <label class="sr" for="lib-era">${t("Era","الحقبة")}</label><select class="select" id="lib-era" data-lib="era"><option value="">${t("All eras","كل الحقب")}</option>${eras.map(e => `<option value="${e}" ${f.era === e ? "selected" : ""}>${ar() ? eraAr[e] : e}</option>`).join("")}</select>
        </div>
        <div class="lib-scroll" id="lib-grid">${libGridHTML()}</div>
      </div>
      <div class="detail">
        ${f.custom ? `<div class="detail-body"><button class="btn ghost mobile-back" data-act="lib-back">${ic("left","flip")}${t("Back","رجوع")}</button><h3>${t("Create your own perspective","أنشئ منظورك الخاص")}</h3><p class="muted" style="font-size:13.5px;margin:4px 0 0">${t("A client, a board member, your future self — anyone whose view matters here.","عميل، عضو مجلس إدارة، نفسك في المستقبل — أي شخص يهم رأيه هنا.")}</p>
          <form class="custom-form" id="custom-form">
            <div class="field"><label class="label" for="cf-name">${t("Name or role","الاسم أو الدور")}</label><input class="input" id="cf-name" required maxlength="80" placeholder="${esc(t("e.g. Our largest client","مثال: أكبر عملائنا"))}"></div>
            <div class="field"><label class="label" for="cf-bg">${t("Background","الخلفية")}</label><textarea class="ta" id="cf-bg" maxlength="400"></textarea></div>
            <div class="field"><label class="label" for="cf-pv">${t("How they see the world","كيف يرى العالم")}</label><textarea class="ta" id="cf-pv" maxlength="400"></textarea></div>
            <div class="field"><label class="label" for="cf-pr">${t("What they care about","ما يهمه")}</label><input class="input" id="cf-pr" maxlength="200"></div>
            <button class="btn primary block" type="submit">${t(`Seat at chair ${f.seat + 1}`,`أجلسه في المقعد ${f.seat + 1}`)}</button></form></div>` :
        `<div class="detail-body"><button class="btn ghost mobile-back" data-act="lib-back">${ic("left","flip")}${t("Back to library","العودة للمكتبة")}</button>
          <span style="color:var(--brand);font-size:12.5px;font-weight:600">${esc(domainOf(pv))}${pv.sub ? " · " + esc(pv.sub) : ""}</span>
          <h3>${esc(pv.name)}</h3>${pv.ar && pv.ar !== pv.name ? `<div class="ar" lang="ar">${esc(pv.ar)}</div>` : ""}
          <p class="muted" style="font-size:13px;margin:6px 0 0">${esc(typeLabel(pv))}${pv.era ? " · " + esc(ar() ? (ERA_AR[pv.era] || pv.era) : pv.era) : ""}${pv.region ? " · " + esc(pv.region) : ""}</p>
          <dl><div><dt>${t("In a sentence","باختصار")}</dt><dd>${esc(pv.tagline)}</dd></div><div><dt>${t("Who they are", fem(pv) ? "من هي" : "من هو")}</dt><dd>${esc(pv.brief)}</dd></div>${pv.worldview ? `<div><dt>${t("Worldview", fem(pv) ? "رؤيتها" : "رؤيته")}</dt><dd>${esc(pv.worldview)}</dd></div>` : ""}${pv.values ? `<div><dt>${t("Values","القيم")}</dt><dd>${esc(pv.values)}</dd></div>` : ""}${pv.topics ? `<div><dt>${t("Best at the table for","الأنسب لـ")}</dt><dd>${esc(pv.topics)}</dd></div>` : ""}${pv.questions ? `<div><dt>${t("Questions they ask", fem(pv) ? "أسئلتها المعتادة" : "أسئلته المعتادة")}</dt><dd>${esc(pv.questions)}</dd></div>` : ""}${pv.blind ? `<div><dt>${t("Blind spots","نقاط عمياء")}</dt><dd>${esc(pv.blind)}</dd></div>` : ""}</dl></div>
        <div class="detail-foot">${pvSeat >= 0 ? `<button class="btn block" disabled>${pvSeat === f.seat ? t("Already in this chair","موجود في هذا المقعد") : t(`Already at chair ${pvSeat + 1}`,`في المقعد ${pvSeat + 1}`)}</button>` : `<button class="btn primary block" data-act="lib-seat" data-id="${pv.id}">${f.add ? t("Add to the table", fem(pv) ? "أضفها إلى الطاولة" : "أضفه إلى الطاولة") : t(`Seat at chair ${f.seat + 1}`, fem(pv) ? `أجلسها في المقعد ${f.seat + 1}` : `أجلسه في المقعد ${f.seat + 1}`)}</button>`}</div>`}
      </div>
    </div>
    <div class="lib-seats" aria-label="${t("Current table","الطاولة الحالية")}">${seatPeople(s).map((p, i) => `<span class="${i === f.seat ? "cur" : ""}">${i + 1} · ${esc(nameOf(p))}</span>`).join("")}</div>
  </div></div>`;
}

/* ---------- render ---------- */
function render(){
  const pb = state.view === "discuss" ? $("#msgs") : null; const prevY = pb ? pb.scrollTop : null;
  document.documentElement.lang = state.lang; document.documentElement.dir = ar() ? "rtl" : "ltr";
  const v = state.view; const R = $("#root");
  if (v === "splash") R.innerHTML = splashHTML();
  else if (v === "welcome") R.innerHTML = welcomeHTML();
  else R.innerHTML = headerHTML() + `<main class="wrap">${v === "home" ? homeHTML() : v === "assemble" ? assembleHTML() : discussHTML()}</main>` + (v === "home" ? footHTML() : `<footer class="credit-foot">${creditHTML()}</footer>`);
  state.justSeated = false;
  renderLayer();
  if (v === "discuss"){
    // scroll rules: a new answer is shown from its first line; otherwise keep the reader where they are
    const b = $("#msgs");
    if (state.anchorId){ scrollToMsg(state.anchorId); state.anchorId = ""; }
    else if (prevY != null && b) b.scrollTop = prevY;
    else scrollMsgs();
    const box = $("#msgs"), j = $(".jump"); if (box && j) box.addEventListener("scroll", () => { j.hidden = box.scrollHeight - box.scrollTop - box.clientHeight < 160; }, { passive: true }); }
}
function renderLayer(){ $("#layer").innerHTML = layerHTML(); const f = $("#layer [data-autofocus]") || $("#layer .modal button, #layer .drawer button"); f?.focus({ preventScroll: true }); if (!state.modal && state.view === "welcome") $("[data-autofocus]")?.focus({ preventScroll: true }); }
// Show the newest message from its first line; the reader scrolls down to read on.
function scrollToMsg(id){
  const m = $("#msgs"), el = document.getElementById("m-" + id); if (!m || !el) return scrollMsgs();
  m.scrollTop += el.getBoundingClientRect().top - m.getBoundingClientRect().top - 12;
}
function scrollMsgs(){
  const m = $("#msgs"); if (!m) return;
  const persona = m.querySelectorAll(".msg.persona"); const all = persona.length ? persona : m.querySelectorAll(".msg:not(.event)"); const last = all[all.length - 1];
  if (!last){ m.scrollTop = 0; return; }
  m.scrollTop += last.getBoundingClientRect().top - m.getBoundingClientRect().top - 12;
}
function refreshConvoHead(){ const h = $("#convo-head"); if (h && state.s) h.innerHTML = convoHeadInner(state.s); }
function updateStreaming(msg){
  const el = document.getElementById("m-" + msg.id); if (!el){ render(); return; }
  el.querySelector(".text").innerHTML = md(displayText(msg.text));
  // no auto-follow while text streams in: the message stays anchored at its beginning
}
function refreshHome(){ const y = window.scrollY; const qv = $("#q")?.value; if (qv != null) state.draft.question = qv; const open = $("#opts")?.open; const focusQ = document.activeElement?.id === "q"; render(); if (open) $("#opts").open = true; window.scrollTo(0, y); if (focusQ){ const q = $("#q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }

/* ---------- flow ---------- */
function newSession(){
  const d = state.draft;
  const md0 = MODES.find(m => m.id === d.mode) || MODES[0];
  return { id: uid(), preseat: d.preseat || "", question: d.question.trim(), context: d.context.trim(), topic: d.topic || inferTopic(d.question), mode: md0.id, goal: md0.en[0],
    lang: d.dlang, count: d.count, style: md0.id === "debate" ? "challenging" : md0.id === "brainstorm" ? "collaborative" : "balanced", length: "medium", rounds: 3, religious: "respectful", seats: [], reasons: {}, customs: [], pins: [], checks: {}, followups: [],
    messages: [], turn: 0, stage: "assemble", synthesis: "", pickedBy: "", createdAt: Date.now(), updatedAt: Date.now() };
}
async function assemble(){
  const d = state.draft; if (d.question.trim().length < 8) return;
  if (state.history.length >= (window.COUNCIL_BACKUPS?.MAX_DISCUSSIONS || 1000)){ toast(t("This browser has reached its 1,000-discussion limit. Export a backup before removing or clearing any history.","بلغ هذا المتصفح حدّ ١٬٠٠٠ نقاش. نزّل نسخة احتياطية قبل حذف أي جزء من السجل."), { kind: "err" }); return; }
  if (authOn() && !state.demoChosen && sample){
    if (!signedSite()){ gotoSignin(t("Sign in with your email to start a live discussion.","سجّل الدخول ببريدك لبدء نقاش مباشر.")); return; }
    if (AUTH.state.left <= 0){ state.modal = { kind: "quota" }; renderLayer(); return; }
  }
  if (state.mode === "checking"){ state.view = "assemble"; state.s = newSession(); state.picking = true; state.pickMode = "ai"; render(); await ensureMode(); }
  stopAll(); state.s = newSession(); state.draft.preseat = ""; state.view = "assemble"; state.picking = true; state.pickMode = state.mode === "live" ? "ai" : "quick"; render(); window.scrollTo(0, 0);
  const s = state.s; let picks = [];
  if (state.mode === "live" && sample){
    try { picks = await pickWithAI(s.question, s.context, s.topic, s.goal, s.count, s.lang); if (state.s !== s || !state.picking) return; s.pickedBy = "ai"; }
    catch (e){ if (state.s !== s || !state.picking) return; if (e?.code === "quota_exceeded" || e?.code === "signin_required"){ authBlocked(e); return; } if (PERMANENT.has(e?.code)) dropToDemo(e.code); else if (e?.code !== "cancelled") notify(t("Claude couldn't choose the table this time, so we used quick picks.","تعذّر على Claude اختيار الطاولة هذه المرة، فاستخدمنا الاختيار السريع.")); }
  } else await new Promise(r => setTimeout(r, 1100));
  if (state.s !== s || !state.picking) return;
  if (picks.length < s.count){ const extra = quickPicks(s.question, s.topic, s.count + picks.length).filter(x => !picks.some(p => p.id === x.id)); picks = [...picks, ...extra].slice(0, s.count); if (!s.pickedBy) s.pickedBy = "quick"; }
  seatPicks(s, picks);
}
function seatPicks(s, picks){
  if (s.preseat && BY_ID.has(s.preseat) && !picks.some(p => p.id === s.preseat)) picks = [{ id: s.preseat, why: s.lang === "ar" ? "دعوتَه بنفسك إلى الطاولة." : "You invited this member to the table.", position: "" }, ...picks].slice(0, Math.max(2, s.count || picks.length));
  s.seats = picks.map(p => p.id); s.reasons = Object.fromEntries(picks.map(p => [p.id, { why: p.why, position: p.position }])); state.picking = false; state.justSeated = true; save(); render(); }
function useQuickPicks(){ const s = state.s; if (!s) return; s.pickedBy = "quick"; seatPicks(s, quickPicks(s.question, s.topic, s.count)); }
function accept(){
  const s = state.s; s.stage = "discuss";
  try { if (!s.statsSent && window.COUNCIL_STATS && state.mode === "live"){ s.statsSent = true; window.COUNCIL_STATS.record(s.seats, s.id); } } catch {}
  state.draft.preseat = "";
  if (!s.messages.length){
    const names = seatPeople(s).map(p => nameOf(p)).join(s.lang === "ar" ? "، " : ", ");
    s.messages.push({ id: uid(), type: "mod", text: s.lang === "ar" ? `أهلاً بكم إلى الطاولة. سؤالنا: **${s.question}**\n\nيجلس معنا: ${names}. سنختبر الافتراضات، ونرحب بالاختلاف، ونبحث عن خطوة تالية مفيدة. يمكنك التدخل في أي لحظة.` : `Welcome to the table. Our question: **${s.question}**\n\nJoining us: ${names}. We'll test assumptions, welcome disagreement, and look for a useful next step. Step in at any time.` });
  }
  state.view = "discuss"; save(); render(); window.scrollTo(0, 0);
}
// Stop whatever is running and free the controls right away (even if the AI is slow to acknowledge the stop).
function stopAll(){ state.autoplay = false; ctl?.abort(); ctl = null; if (state.busy){ state.runId = (state.runId || 0) + 1; endBusy(); } }
let labelTimer = null;
function startBusy(kind, labels){ state.busy = true; state.busyKind = kind; let i = 0; state.busyLabel = labels[0]; clearInterval(labelTimer); labelTimer = setInterval(() => { i = Math.min(i + 1, labels.length - 1); state.busyLabel = labels[i]; document.querySelectorAll(".thinking .bl").forEach(el => el.textContent = state.busyLabel); }, 8000); }
function endBusy(){ state.busy = false; state.busyKind = ""; state.speaking = -1; clearInterval(labelTimer); }
function finalizeMsg(s, msg){
  const sp = splitMeta(msg.text); msg.text = sp.body || msg.text;
  if (sp.stance != null){ msg.stance = sp.stance; msg.position = sp.position; }
  if (sp.ask) s.suggest = sp.ask;
}
async function contribute(seatIndex, existingMsg){
  const s = state.s;
  if (!s){ toast(t("Open a discussion first.","افتح نقاشاً أولاً."), { kind: "err" }); console.warn("[council] next: no session"); return false; }
  if (state.busy){
    // a stale "busy" with nothing actually running (no request, nobody speaking) must never block the table
    const stale = !ctl && state.speaking < 0 && state.busyKind !== "connect" && state.busyKind !== "synth";
    console.warn("[council] next while busy", { kind: state.busyKind, speaking: state.speaking, hasCtl: !!ctl, stale });
    if (!stale){ toast(t("Please wait — a member is still speaking.","انتظر — ما زال أحد الأعضاء يتحدث.")); return false; }
    state.runId = (state.runId || 0) + 1; endBusy();
  }
  s.touched = true;
  if (state.mode === "checking"){
    // live AI still connecting: say so instead of looking frozen
    startBusy("connect", [t("Connecting to Claude…","جارٍ الاتصال بـ Claude…")]); render();
    const hint = setTimeout(() => { if (state.busyKind === "connect") toast(t("Still connecting to Claude. If Claude asks for permission to use AI, allow it.","ما زال الاتصال بـ Claude جارياً. إذا طلب Claude إذناً لاستخدام الذكاء الاصطناعي فاسمح به."), { ms: 8000 }); }, 3500);
    const run0 = state.runId || 0; await ensureMode(); clearTimeout(hint);
    if (run0 !== (state.runId || 0) || state.s !== s) return false;
    endBusy();
  }
  const seat = seatIndex ?? nextSeat(s); const p = personaOf(s, s.seats[seat]);
  if (s.nextPid === p.id) s.nextPid = "";
  const msg = existingMsg || { id: uid(), type: "persona", pid: p.id, text: "", round: Math.floor(s.turn / s.seats.length) + 1 };
  if (!existingMsg) s.messages.push(msg); msg.text = ""; msg.interrupted = false; msg.demo = false; msg.stance = null;
  state.speaking = seat; state.anchorId = msg.id; startBusy("persona", [t("Reading the discussion…","يقرأ النقاش…"), t("Weighing the arguments…","يوازن الحجج…"), t("Choosing words carefully…","ينتقي كلماته بعناية…")]); render();
  const run = state.runId || 0;
  if (state.mode !== "live" || !sample){
    await new Promise(r => setTimeout(r, 1000));
    if (run !== (state.runId || 0)){ if (!msg.text) s.messages = s.messages.filter(x => x !== msg); save(s); if (state.s === s) render(); return false; }
    msg.text = demoContribution(s, seat); msg.demo = true;
  } else {
    ctl = new AbortController();
    try { await sample(contributionPrompt(s, seat), { signal: ctl.signal, cache: false, onText: ({ text }) => { msg.text = text; updateStreaming(msg); } }); }
    catch (e){
      if (PERMANENT.has(e?.code)){ dropToDemo(e.code); msg.text = demoContribution(s, seat); msg.demo = true; }
      else if (e?.code === "refused"){ s.messages = s.messages.filter(x => x !== msg); notify(codeCopy(e.code), "err"); if (run === (state.runId || 0)) endBusy(); save(s); render(); return false; }
      else { msg.text = displayText(e?.text || "") || (e?.code === "cancelled" ? t("_Stopped._","_تم الإيقاف._") : t("_No answer received._","_لم تصل إجابة._")); msg.interrupted = true; if (e?.code !== "cancelled") notify(codeCopy(e?.code), "err"); endBusy(); save(); render(); return false; }
    } finally { ctl = null; }
  }
  finalizeMsg(s, msg);
  if (!msg.counted){ msg.counted = true; s.turn += 1;
    if (s.turn % s.seats.length === 0){ const round = s.turn / s.seats.length; const r = { id: uid(), type: "recap", round, text: recapText(s, round) }; const g = widestGap(s); if (g) r.gap = g; s.messages.push(r); } }
  const current = run === (state.runId || 0);
  if (current) endBusy();
  save(s); if (current || state.s === s) render(); return current;
}
async function rewriteDemo(){
  const s = state.s; if (!s || state.busy || state.mode !== "live") return; state.autoplay = true;
  for (const m of s.messages.filter(x => x.type === "persona" && x.demo)){
    if (!state.autoplay || state.s !== s) break;
    const ok = await contribute(s.seats.indexOf(m.pid) >= 0 ? s.seats.indexOf(m.pid) : undefined, m); if (!ok) break;
  }
  state.autoplay = false; s.messages.filter(m => m.type === "recap").forEach(r => { r.text = recapText(s, r.round, s.messages.slice(0, s.messages.indexOf(r))); r.gap = widestGap({ ...s, messages: s.messages.slice(0, s.messages.indexOf(r)) }) || undefined; });
  save(); render();
}
async function autoplay(){
  const s = state.s; if (state.busy) return; state.autoplay = true;
  const target = Math.min(s.rounds * s.seats.length, (Math.floor(s.turn / s.seats.length) + 1) * s.seats.length);
  while (state.autoplay && state.s === s && s.turn < target){ const ok = await contribute(); if (!ok) break; }
  state.autoplay = false; render();
}
function sendHost(text){
  const s = state.s; text = (text || "").trim(); if (!text || state.busy) return;
  const to = s.to || "all";
  s.touched = true; s.suggest = "";
  s.messages.push({ id: uid(), type: "host", text, to }); s.hostDraft = ""; s.to = "all"; save();
  contribute(to !== "all" ? s.seats.indexOf(to) : undefined);
}
async function synthesize(force){
  const s = state.s; if (!s) return; s.touched = true;
  await ensureMode();
  if (s.synthesis && !force){ state.modal = { kind: "synth" }; renderLayer(); return; }
  state.modal = { kind: "synth", text: "" };
  startBusy("synth", [t("Reviewing the discussion…","يراجع النقاش…"), t("Sorting agreements and disagreements…","يرتّب نقاط الاتفاق والخلاف…"), t("Writing the decision brief…","يكتب الخلاصة…")]); renderLayer(); refreshConvoHead();
  const run = state.runId || 0;
  if (state.mode !== "live" || !sample){ await new Promise(r => setTimeout(r, 1100)); const sp = splitMeta(demoSynthesis(s)); s.synthesis = sp.body; s.followups = sp.followups; s.synthDemo = true; s.checks = {}; }
  else {
    ctl = new AbortController();
    try { const r = await sample(synthesisPrompt(s), { signal: ctl.signal, cache: false, onText: ({ text }) => { state.modal && (state.modal.text = displayText(text)); const b = $("#synth-body"); if (b) b.innerHTML = md(displayText(text)); } }); const sp = splitMeta(r.text); s.synthesis = sp.body; s.followups = sp.followups; s.synthDemo = false; s.checks = {}; }
    catch (e){ if (PERMANENT.has(e?.code)){ dropToDemo(e.code); const sp = splitMeta(demoSynthesis(s)); s.synthesis = sp.body; s.followups = sp.followups; s.synthDemo = true; } else { if (e?.code !== "cancelled") notify(codeCopy(e?.code), "err"); if (e?.text) s.synthesis = displayText(e.text); } }
    finally { ctl = null; }
  }
  const current = run === (state.runId || 0);
  if (current){ endBusy(); state.modal = s.synthesis ? { kind: "synth" } : null; }
  save(s); if (state.s === s) render();
}
function transcriptMD(s){
  const lines = [`# ${s.question}`, "", `_${new Date(s.updatedAt).toLocaleString()} · The Council · An Emad Hanna product_`, "", `**${s.lang === "ar" ? "المشاركون" : "Participants"}:** ${seatPeople(s).map(p => p.name).join(", ")}`, ""];
  for (const m of s.messages){
    if (m.type === "event") lines.push(`_${m.text}_`, "");
    else if (m.type === "mod") lines.push(`**Moderator:** ${m.text}`, "");
    else if (m.type === "host") lines.push(`**${signedSite() ? AUTH.state.name : "Host"}${m.to && m.to !== "all" ? " → " + (personaOf(s, m.to)?.name || "") : ""}:** ${m.text}`, "");
    else if (m.text) lines.push(`### ${personaOf(s, m.pid)?.name || ""}${(s.pins || []).includes(m.id) ? " 📌" : ""}`, m.text, "");
  }
  if (s.synthesis) lines.push("---", "", "# Decision brief", "", s.synthesis);
  lines.push("", "---", "_AI-simulated perspectives. No real participant or endorsement._");
  return lines.join("\n");
}
async function copyText(text){ try { await navigator.clipboard.writeText(text); toast(t("Copied to clipboard","تم النسخ")); } catch { toast(t("Copy isn't allowed here — use Download instead.","النسخ غير مسموح هنا، استخدم التنزيل."), { kind: "err" }); } }
async function downloadTranscript(){
  const s = state.s; if (!s) return; const text = transcriptMD(s);
  if (!downloads){ copyText(text); return; }
  try { await downloads.save({ filename: `council-${s.question.slice(0, 40).replace(/[^\w؀-ۿ]+/g, "-").replace(/^-|-$/g, "") || "discussion"}.md`, data: text }); }
  catch (e){ if (e?.code && !/cancel|declin|denied/i.test(e.code)) copyText(text); }
}
function openSession(id){ let h = state.history.find(x => x.id === id); if (!h) return;
  if (Object.isFrozen(h) || Object.isFrozen(h.messages)){ h = JSON.parse(JSON.stringify(h)); state.history = state.history.map(x => x.id === id ? h : x); } stopAll(); state.s = h; state.view = h.stage === "discuss" ? "discuss" : "assemble"; state.picking = false; render(); window.scrollTo(0, 0); }
function backupError(code, index){
  const errors = {
    too_large: t("This file is larger than the 10 MB backup limit.","حجم الملف أكبر من حد النسخة الاحتياطية البالغ ١٠ ميغابايت."),
    format: t("This is not a supported Council backup (version 1 JSON required).","هذه ليست نسخة احتياطية مدعومة من المجلس (يلزم ملف JSON بالإصدار ١)."),
    capacity: t("Restore would exceed the 1,000-discussion browser limit. No discussions were changed.","ستتجاوز الاستعادة حدّ المتصفح البالغ ١٬٠٠٠ نقاش. لم تتغير أي نقاشات."),
    duplicate: t("The backup contains duplicate discussion IDs and cannot be restored safely.","تحتوي النسخة الاحتياطية على معرفات نقاش مكررة، ولا يمكن استعادتها بأمان."),
    id: t("A discussion or message has an invalid ID.","يوجد معرف غير صالح لنقاش أو رسالة."),
    question: t("A discussion is missing a valid question.","يفتقد أحد النقاشات إلى سؤال صالح."),
    text: t("A discussion contains invalid or unsafe text.","يحتوي أحد النقاشات على نص غير صالح أو غير آمن."),
    seats: t("A discussion has an invalid council seat list.","تحتوي إحدى النقاشات على قائمة مقاعد غير صالحة."),
    personas: t("A custom persona is incomplete or invalid.","يوجد منظور مخصص ناقص أو غير صالح."),
    messages: t("A discussion contains invalid messages.","يحتوي أحد النقاشات على رسائل غير صالحة."),
    pins: t("A pinned point does not match a message in the backup.","لا تطابق إحدى النقاط المثبتة أي رسالة في النسخة الاحتياطية."),
    brief: t("A decision brief or follow-up has an invalid shape.","تحتوي الخلاصة أو أسئلة المتابعة على بنية غير صالحة."),
    unknown: t("The backup contains unsupported fields and cannot be imported safely.","تحتوي النسخة الاحتياطية على حقول غير مدعومة، ولا يمكن استيرادها بأمان."),
    shape: t("The backup discussion data is incomplete or invalid.","بيانات إحدى النقاشات ناقصة أو غير صالحة.")
  };
  return (errors[code] || t("The backup could not be validated.","تعذّر التحقق من النسخة الاحتياطية.")) +
    (Number.isInteger(index) ? t(` (discussion ${index + 1}).`,` (النقاش ${index + 1}).`) : "");
}
function exportBackup(){
  const api = window.COUNCIL_BACKUPS;
  if (!api){ toast(t("Backup tools are unavailable until the Council backup helper is loaded.","أدوات النسخ الاحتياطي غير متاحة حتى تحميل أداة النسخ الاحتياطي للمجلس."), { kind: "err" }); return; }
  try {
    const json = api.exportBackup(state.history);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `the-council-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(t(`${state.history.length} discussions downloaded as a browser backup.`,`تم تنزيل ${state.history.length} نقاشات كنسخة احتياطية من المتصفح.`));
  } catch (e){ toast(backupError(e?.code || "shape", e?.index), { kind: "err" }); }
}
async function restoreBackup(file){
  if (!file) return;
  const api = window.COUNCIL_BACKUPS;
  if (!api){ state.backupResult = t("Backup tools are unavailable. Reload after the backup helper is added.","أدوات النسخ الاحتياطي غير متاحة. أعد التحميل بعد إضافة أداة النسخ."); renderLayer(); return; }
  if (file.size > api.MAX_BYTES){ state.backupResult = backupError("too_large"); renderLayer(); return; }
  try {
    const raw = await file.text();
    const data = JSON.parse(raw);
    const merged = api.merge(state.history, data);
    if (!merged.ok){ state.backupResult = backupError(merged.error, merged.index); renderLayer(); return; }
    if (!store.set(HISTORY_KEY, merged.discussions)){
      state.backupResult = t("The browser couldn't save this backup. Your existing discussions are unchanged; check available storage and try again.","تعذّر على المتصفح حفظ هذه النسخة. لم تتغير نقاشاتك الحالية؛ تحقّق من مساحة التخزين ثم حاول مجدداً.");
      renderLayer(); return;
    }
    state.history = merged.discussions;
    state.backupResult = t(`Restored ${merged.restored}; skipped ${merged.skipped} duplicate ${merged.skipped === 1 ? "discussion" : "discussions"}. Existing discussions were kept.`,`تمت استعادة ${merged.restored} وتخطي ${merged.skipped} نقاشات مكررة. احتُفظ بالنقاشات الموجودة.`);
    renderLayer();
    if (state.view === "home") refreshHome();
  } catch (e){
    state.backupResult = e instanceof SyntaxError ? t("This file isn't valid JSON. Your discussions were not changed.","هذا الملف ليس بصيغة JSON صالحة. لم تتغير نقاشاتك.") :
      t("The file couldn't be read. Your discussions were not changed.","تعذّرت قراءة الملف. لم تتغير نقاشاتك.");
    renderLayer();
  }
}
function deleteSession(id){
  const idx = state.history.findIndex(h => h.id === id); if (idx < 0) return;
  const item = state.history[idx];
  state.history.splice(idx, 1); persistLocal();
  if (state.s?.id === id){ stopAll(); state.s = null; state.view = "home"; }
  state.menu = ""; render();
  let undone = false;
  const timer = setTimeout(() => { if (!undone){ const col = userCol(); clearTimeout(sync.timers[id]); if (col) col.doc("d-" + id).delete().catch(() => {}); } }, 6500);
  toast(t("Discussion deleted","تم حذف النقاش"), { action: { label: t("Undo","تراجع"), fn: () => { undone = true; clearTimeout(timer); state.history.splice(idx, 0, item); persistLocal(); render(); } } });
}
function replaceSeat(seat, persona){
  const s = state.s; const old = personaOf(s, s.seats[seat]);
  if (!old){ if (persona.type === "custom") s.customs = [...(s.customs || []), persona]; s.seats.push(persona.id); s.reasons[persona.id] = s.reasons[persona.id] || { why: persona.tagline || "", position: "" };
    s.messages.push({ id: uid(), type: "event", text: s.lang === "ar" ? `انضم ${persona.ar || persona.name} إلى الطاولة.` : `${persona.name} joined the table.` });
    state.modal = null; state.lib = null; save(); render(); toast(t(`${persona.name} joined the table`,`انضم ${persona.ar || persona.name} إلى الطاولة`)); return; }
  if (persona.type === "custom") s.customs = [...(s.customs || []), persona];
  s.seats[seat] = persona.id;
  s.reasons[persona.id] = s.reasons[persona.id] || { why: persona.tagline || "", position: "" };
  if (s.stage === "discuss") s.messages.push({ id: uid(), type: "event", text: s.lang === "ar" ? `غادر ${nameOf(old)} المقعد ${seat + 1} وانضم ${persona.ar || persona.name}. المساهمات السابقة محفوظة.` : `${old.name} left chair ${seat + 1}; ${persona.name} joined. Earlier contributions are kept.` });
  state.modal = null; state.lib = null; save(); render();
  toast(t(`${persona.name} is now at chair ${seat + 1}`,`${persona.ar || persona.name} الآن في المقعد ${seat + 1}`));
}
function signOut(clear){
  stopAll();
  state.recoveryCodes = []; state.recoveryBusy = false;
  const siteAccount = signedSite();
  const signOutRequest = siteAccount ? AUTH.signOut() : null;
  if (siteAccount) state.auth = { step: "signin", email: "", name: "", password: "", confirm: "", busy: false, err: "" };
  const wasSigned = !!state.me.id; const unsynced = wasSigned && sync.status === "error";
  if (clear || (wasSigned && !unsynced)){ state.history = []; persistLocal(); }
  state.me = { id: null, name: "", avatarUrl: "" }; state.s = null;
  if (wasSigned) prefs.signedOut = true;
  prefs.onboarded = false; store.set(PREF_KEY, prefs); sync.status = "local";
  state.modal = null; state.menu = ""; state.view = "welcome"; render(); window.scrollTo(0, 0);
  const msg = clear ? t("Signed out and cleared this browser.","تم تسجيل الخروج ومسح هذا المتصفح.") : siteAccount ? t("Signed out. Your browser discussions are still here.","تم تسجيل الخروج. نقاشات متصفحك ما زالت هنا.") : unsynced ? t("Signed out. Some discussions hadn't synced, so they're still in this browser.","تم تسجيل الخروج. بعض النقاشات لم تُزامَن، لذا بقيت في هذا المتصفح.") : wasSigned ? t("Signed out. Your discussions are safe in your Claude account.","تم تسجيل الخروج. نقاشاتك محفوظة في حسابك في Claude.") : t("Signed out.","تم تسجيل الخروج.");
  if (signOutRequest) signOutRequest.then(() => toast(msg)).catch(() => toast(t("Couldn't sign out. Please try again; your browser discussions are safe.","تعذّر تسجيل الخروج. حاول مجدداً؛ نقاشات المتصفح محفوظة."), { kind: "err" }));
  else toast(msg);
}
async function signIn(){
  prefs.signedOut = false; store.set(PREF_KEY, prefs); state.menu = "";
  if (!userCap){ render(); toast(t("Signing in uses your Claude account — open The Council inside Claude to sign in.","تسجيل الدخول يستخدم حسابك في Claude — افتح المجلس داخل Claude لتسجيل الدخول."), { kind: "err" }); return; }
  try { const me = await userCap.me(); if (me?.id){ state.me = { id: me.id, name: me.name || "", avatarUrl: me.avatarUrl || "" }; if (db) await loadRemote(); } } catch {}
  render();
  toast(state.me.id ? t(`Signed in as ${state.me.name || "you"}`,`تم تسجيل الدخول باسم ${state.me.name || ""}`) : t("Couldn't sign in right now. Try again in a moment.","تعذّر تسجيل الدخول الآن. حاول بعد قليل."), { kind: state.me.id ? "" : "err" });
}
function enter(demo){
  prefs.onboarded = true; state.demoChosen = !!demo; state.mode = computeMode(); savePrefs();
  state.view = state.s ? (state.s.stage === "discuss" ? "discuss" : "assemble") : "home"; render(); window.scrollTo(0, 0);
}

function flash(sel){ const el = typeof sel === "string" ? $(sel) : sel; if (!el) return; el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
function fillComposer(text, to){
  const s = state.s; if (!s) return;
  if (to) s.to = to; s.hostDraft = text; state.menu = "";
  render(); const box = $("#hostmsg"); if (!box) return;
  box.value = text; box.style.height = "auto"; box.style.height = Math.min(140, box.scrollHeight) + "px";
  box.focus({ preventScroll: true }); box.setSelectionRange(text.length, text.length); flash(".inputbar");
}

/* ---------- @mentions ---------- */
function detectMention(box){
  const before = box.value.slice(0, box.selectionStart);
  const m = before.match(/(^|\s)@([^\s@]{0,24})$/u);
  if (m){ const q = m[2]; const start = before.length - q.length - 1; state.mention = { q, k: state.mention?.q === q ? state.mention.k : 0 }; state.mentionRange = [start, box.selectionStart]; }
  else { state.mention = null; state.mentionRange = null; }
  renderMention();
}
function renderMention(){
  const el = $("#mention"); if (!el) return;
  if (!state.mention || !state.s){ el.hidden = true; el.innerHTML = ""; return; }
  el.hidden = false; el.innerHTML = `<div class="menu mention-menu" role="listbox">${toMenuItems(state.s, state.mention.q).replace(/data-id="all"[^>]*>[\s\S]*?<\/button>/, m => state.mention.q ? "" : m)}</div>`;
  el.querySelectorAll("[data-act='to']").forEach((b, i) => b.classList.toggle("hl", i === state.mention.k));
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el){ if (state.menu){ state.menu = ""; render(); } return; }
  const a = el.dataset.act;
  if (a === "close-scrim"){ if (e.target === el){ if ((state.busy && state.modal?.kind === "synth") || (state.recoveryBusy && state.modal?.kind === "recovery")) return; if (state.modal?.kind === "recovery") state.recoveryCodes = []; state.modal = null; state.lib = null; renderLayer(); } return; }
  const hadMenu = state.menu; if (a !== "menu") state.menu = "";
  switch (a){
    case "home": stopAll(); if (state.s){ state.draft.question = ""; state.draft.context = ""; } state.view = "home"; state.s = null; render(); window.scrollTo(0, 0); break;
    case "new": stopAll(); state.view = "home"; state.s = null; state.draft.question = ""; state.draft.context = ""; render(); $("#q")?.focus(); break;
    case "lang": state.lang = ar() ? "en" : "ar"; if (!state.s) state.draft.dlang = state.lang; savePrefs(); render(); break;
    case "set-lang": state.lang = el.dataset.v; state.draft.dlang = state.lang; savePrefs(); render(); break;
    case "toggle-mode": if (!sample) break; if (authOn() && !signedSite() && state.mode !== "live"){ gotoSignin(t("Sign in with your email to use live AI.","سجّل الدخول ببريدك لاستخدام الذكاء المباشر.")); break; } state.demoChosen = state.mode === "live"; state.liveBlocked = state.demoChosen ? state.liveBlocked : ""; state.mode = computeMode(); render(); toast(state.mode === "live" ? t("Live AI answers are on","الإجابات المباشرة مفعّلة") : t("Demo mode — scripted answers","الوضع التوضيحي — إجابات مكتوبة")); break;
    case "welcome": stopAll(); state.view = "welcome"; render(); window.scrollTo(0, 0); break;
    case "enter": enter(false); break;
    case "set-theme": setTheme(el.dataset.v); state.menu = hadMenu; render(); break;
    case "toggle-theme": setTheme(effTheme() === "dark" ? "light" : "dark"); refreshChrome(); toast(effTheme() === "dark" ? t("Dark theme","المظهر الداكن") : t("Light theme","المظهر الفاتح")); break;
    case "sign-out-ask": state.modal = { kind: "signout" }; render(); break;
    case "sign-out": signOut(el.dataset.clear === "1"); break;
    case "sign-in": signIn(); break;
    case "go-signin": gotoSignin(); break;
    case "auth-mode": state.auth = { ...state.auth, step: el.dataset.v, password: "", confirm: "", err: "", busy: false }; render(); break;
    case "auth-refresh": AUTH.refresh().then(() => { if (!AUTH.state.unavailable) render(); }).catch(() => {}); break;
    case "feature-seat": { const id = el.dataset.id; state.draft.preseat = state.draft.preseat === id ? "" : id; refreshHome(); if (state.draft.preseat){ const q = $("#q"); q?.focus({ preventScroll: true }); flash(".qbox"); toast(t(`${nameOf(BY_ID.get(id))} will take a seat — now write your question`,`${nameOf(BY_ID.get(id))} سيجلس إلى طاولتك — اكتب سؤالك الآن`)); } } break;
    case "clear-preseat": state.draft.preseat = ""; refreshHome(); break;
    case "quota-demo": state.modal = null; state.demoChosen = true; state.mode = computeMode(); render(); assemble(); break;
    case "enter-demo": enter(true); break;
    case "menu": state.menu = state.menu === el.dataset.menu ? "" : el.dataset.menu; if (state.view === "home") refreshHome(); else render(); if (state.menu && state.menu.startsWith("sel-")) $(".dd-menu [aria-selected=\"true\"]")?.focus({ preventScroll: true }); break;
    case "about": state.modal = { kind: "about" }; if (hadMenu) render(); else renderLayer(); break;
    case "close": if (state.recoveryBusy && state.modal?.kind === "recovery") break; if (state.modal?.kind === "recovery") state.recoveryCodes = []; state.modal = null; state.lib = null; renderLayer(); break;
    case "go-recovery": if (state.recoveryBusy || !passwordSiteAccount()) break; state.recoveryCodes = []; state.modal = { kind: "recovery" }; renderLayer(); break;
    case "recovery-generate": generateRecoveryCodes(); break;
    case "recovery-copy": if (state.recoveryCodes.length) copyText(state.recoveryCodes.join("\n")); break;
    case "backup-export": exportBackup(); break;
    case "backup-open": state.backupResult = ""; state.modal = { kind: "backup" }; renderLayer(); break;
    case "backup-import": $("#backup-file")?.click(); break;
    case "toggle-panel": state.panelOpen = !state.panelOpen; render(); break;
    case "count": state.draft.count = +el.dataset.n; refreshHome(); break;
    case "dlang": state.draft.dlang = el.dataset.v; refreshHome(); break;
    case "topic": state.draft.topic = el.dataset.v; refreshHome(); break;
    case "idea": { const qEl = $("#q"); if (qEl) qEl.value = el.dataset.q; } state.draft.question = el.dataset.q; state.draft.topic = state.draft.topic || el.dataset.cat; refreshHome(); { const q = $("#q"); q.style.height = "auto"; q.style.height = Math.max(108, Math.min(260, q.scrollHeight)) + "px"; q.focus({ preventScroll: true }); q.setSelectionRange(q.value.length, q.value.length); flash(".qbox"); toast(t("Added to your question — edit it or assemble your council","أُضيف إلى سؤالك — عدّله أو كوّن مجلسك")); } break;
    case "assemble": assemble(); break;
    case "quickpicks": useQuickPicks(); break;
    case "edit-q": stopAll(); state.draft.question = state.s.question; state.draft.context = state.s.context; state.view = "home"; state.s = null; state.picking = false; render(); break;
    case "set": { const k = el.dataset.k; state.s[k] = k === "rounds" ? +el.dataset.v : el.dataset.v; save(); el.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === el)); } break;
    case "seat": if (state.busy || state.picking) return; state.lib = { seat: +el.dataset.i, q: "", type: "", era: "", domain: "", preview: "", custom: false, showDetail: false }; state.modal = { kind: "lib" }; if (hadMenu) render(); else renderLayer(); break;
    case "lib-preview": { const sc = $("#lib-grid")?.scrollTop; state.lib.preview = el.dataset.id; state.lib.custom = false; state.lib.showDetail = true; renderLayer(); const g = $("#lib-grid"); if (g) g.scrollTop = sc; } break;
    case "lib-back": state.lib.showDetail = false; renderLayer(); break;
    case "lib-reset": Object.assign(state.lib, { q: "", type: "", era: "", domain: "" }); renderLayer(); break;
    case "lib-custom": state.lib.custom = true; state.lib.showDetail = true; renderLayer(); $("#cf-name")?.focus(); break;
    case "lib-seat": replaceSeat(state.lib.seat, BY_ID.get(el.dataset.id)); break;
    case "accept": accept(); break;
    case "next": contribute(); break;
    case "autoplay": autoplay(); break;
    case "stop": stopAll(); render(); if (state.modal?.kind === "synth") renderLayer(); break;
    case "steer": { const q = STEERS[+el.dataset.i]; fillComposer(state.s.lang === "ar" ? q[1] : q[0]); } break;
    case "send": sendHost($("#hostmsg")?.value); break;
    case "reply": setTo(el.dataset.id); render(); $("#hostmsg")?.focus(); break;
    case "pin": { const s = state.s; s.touched = true; s.pins = s.pins || []; const id = el.dataset.id; const on = !s.pins.includes(id); s.pins = on ? [...s.pins, id] : s.pins.filter(x => x !== id); save(); const box = $("#msgs"); const y = box?.scrollTop; render(); const b2 = $("#msgs"); if (b2 && y != null) b2.scrollTop = y; if (on) toast(t("Pinned — the decision brief will give it weight","تم التثبيت — ستراعيه الخلاصة")); } break;
    case "retry": { const m = state.s.messages.find(x => x.id === el.dataset.id); if (m) contribute(state.s.seats.indexOf(m.pid), m); } break;
    case "synth": synthesize(false); break;
    case "regen": synthesize(true); break;
    case "copy-synth": copyText(state.s.synthesis); break;
    case "copy-transcript": render(); copyText(transcriptMD(state.s)); break;
    case "dl-transcript": if (hadMenu) render(); downloadTranscript(); break;
    case "open": openSession(el.dataset.id); break;
    case "example": { stopAll(); const ex = exampleSession(); state.s = ex; state.view = "discuss"; render(); window.scrollTo(0, 0); toast(t("This is a finished example — continue it or start your own.","هذا مثال مكتمل — تابعه أو ابدأ نقاشك الخاص.")); } break;
    case "mode": state.draft.mode = el.dataset.v; refreshHome(); break;
    case "to": setTo(el.dataset.id); { const box = $("#hostmsg"); if (box && state.mentionRange){ const [a0, b0] = state.mentionRange; box.value = box.value.slice(0, a0) + box.value.slice(b0); state.s.hostDraft = box.value; state.mentionRange = null; } } render(); $("#hostmsg")?.focus(); break;
    case "use-suggest": { const q = state.s.suggest; state.s.suggest = ""; fillComposer(q); } break;
    case "face-off": { const s = state.s; const A = personaOf(s, el.dataset.a), B = personaOf(s, el.dataset.b); s.to = A.id; sendHost(s.lang === "ar" ? `${nameOf(B)} يختلف معك. رُدّ مباشرة على أقوى نقطة لديه، وقل ما الذي قد يغيّر رأيك.` : `${B.name} disagrees with you. Respond directly to their strongest point — and say what would change your mind.`); } break;
    case "followup": { const s = state.s; const q = s.followups[+el.dataset.i]; const short = (s.synthesis.split("\n").find(l => l.trim() && !l.startsWith("#")) || "").slice(0, 400);
      stopAll(); state.modal = null; state.draft.question = q; state.draft.context = (s.lang === "ar" ? "متابعة لنقاش: " : "Follow-up to: ") + s.question + (short ? (s.lang === "ar" ? "\nالخلاصة السابقة: " : "\nEarlier conclusion: ") + short : ""); state.draft.mode = s.mode || "explore"; state.draft.dlang = s.lang; state.s = null; state.view = "home"; render(); $("#opts").open = true; $("#q")?.focus(); window.scrollTo(0, 0); } break;
    case "check": { const s = state.s; s.checks = s.checks || {}; s.checks[+el.dataset.i] = el.checked; s.touched = true; save(); } return;
    case "copy-msg": { const m = state.s.messages.find(x => x.id === el.dataset.id); if (m) copyText(m.text); } break;
    case "keys": state.modal = { kind: "keys" }; render(); break;
    case "go-live": if (authOn() && !signedSite()){ gotoSignin(t("Sign in with your email to use live AI.","سجّل الدخول ببريدك لاستخدام الذكاء المباشر.")); break; } state.demoChosen = false; state.liveBlocked = ""; state.mode = computeMode(); render(); toast(t("Live AI answers are on","الإجابات المباشرة مفعّلة")); break;
    case "rewrite-all": rewriteDemo(); break;
    case "speak": contribute(+el.dataset.i); break;
    case "queue": { const s = state.s; s.nextPid = s.seats[+el.dataset.i]; save(); render(); toast(t(`${personaOf(s, s.nextPid).name} will speak next`,`${nameOf(personaOf(s, s.nextPid))} سيتحدث تالياً`)); } break;
    case "ask": { const p = personaOf(state.s, el.dataset.id); fillComposer("", p.id); } break;
    case "remove-seat": { const s = state.s; const i = +el.dataset.i; const p = personaOf(s, s.seats[i]); if (s.seats.length <= 2) break; s.seats.splice(i, 1); if (s.nextPid === p.id) s.nextPid = ""; if (s.to === p.id) s.to = "all"; s.messages.push({ id: uid(), type: "event", text: s.lang === "ar" ? `غادر ${nameOf(p)} الطاولة. مساهماته السابقة محفوظة.` : `${p.name} left the table. Their earlier contributions are kept.` }); save(); render(); toast(t(`${p.name} left the table`,`غادر ${nameOf(p)} الطاولة`)); } break;
    case "add-seat": { const s = state.s; if (s.seats.length >= 5) break; state.lib = { seat: s.seats.length, add: true, q: "", type: "", era: "", domain: "", preview: "", custom: false, showDetail: false }; const sug = quickPicks(s.question, s.topic, 12).find(x => !s.seats.includes(x.id)); if (sug){ state.lib.preview = sug.id; state.lib.showDetail = true; } state.modal = { kind: "lib" }; render(); } break;
    case "add-round": { const s = state.s; s.rounds = Math.min(8, s.rounds + 1); save(); render(); toast(t(`Round ${s.rounds} added`,`أُضيفت الجولة ${s.rounds}`)); } break;
    case "jump": scrollMsgs(); break;
    case "show-meter": $(".side-panel .meter")?.scrollIntoView({ behavior: "smooth", block: "center" }); break;
    case "delete": deleteSession(el.dataset.id); break;
    default: if (hadMenu) render();
  }
});
document.addEventListener("input", e => {
  const id = e.target.id;
  if (id === "auth-email"){ state.auth.email = e.target.value; if (state.auth.err){ state.auth.err = ""; $(".auth-err")?.remove(); } return; }
  if (id === "auth-name"){ state.auth.name = e.target.value; if (state.auth.err){ state.auth.err = ""; $(".auth-err")?.remove(); } return; }
  if (id === "auth-password"){ state.auth.password = e.target.value; if (state.auth.err){ state.auth.err = ""; $(".auth-err")?.remove(); } return; }
  if (id === "auth-confirm"){ state.auth.confirm = e.target.value; if (state.auth.err){ state.auth.err = ""; $(".auth-err")?.remove(); } return; }
  if (id === "auth-recovery-code"){ if (state.auth.err){ state.auth.err = ""; $(".auth-err")?.remove(); } return; }
  if (id === "q"){
    state.draft.question = e.target.value; $("#qcount").textContent = `${e.target.value.length}/600`;
    const ok = e.target.value.trim().length >= 8; $("#assemble-btn").disabled = !ok;
    $("#assemble-hint").innerHTML = ok ? `<kbd>Ctrl</kbd> + <kbd>Enter</kbd> · ${t("you can change every seat next","يمكنك تغيير أي مقعد لاحقاً")}` : t("Write a question of at least a few words.","اكتب سؤالاً من بضع كلمات على الأقل.");
    if (!state.draft.topic){ const det = inferTopic(e.target.value); const o = $("#topic-sel option[value='']"); if (o) o.textContent = t("Auto","تلقائي") + (det ? " · " + topicLabel(det) : ""); }
    e.target.style.height = "auto"; e.target.style.height = Math.max(108, Math.min(260, e.target.scrollHeight)) + "px";
  }
  else if (id === "ctx") state.draft.context = e.target.value;
  else if (id === "hostmsg"){ if (state.s) state.s.hostDraft = e.target.value; e.target.style.height = "auto"; e.target.style.height = Math.min(140, e.target.scrollHeight) + "px"; detectMention(e.target); }
  else if (id === "ctx-live" && state.s){ state.s.context = e.target.value; clearTimeout(state.ctxT); state.ctxT = setTimeout(save, 600); }
  else if (id === "hist-q"){ state.histQ = e.target.value; const pos = e.target.selectionStart; refreshHome(); const hq = $("#hist-q"); if (hq){ hq.focus(); hq.setSelectionRange(pos, pos); } }
  else if (id === "lib-q"){ state.lib.q = e.target.value; $("#lib-grid").innerHTML = libGridHTML(); }
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.id === "backup-file"){ const file = el.files?.[0]; if (file) restoreBackup(file); el.value = ""; return; }
  if (el.id === "goal"){ state.draft.goal = el.value; const s = $("#optsum"); if (s) s.innerHTML = `<b>${state.draft.count}</b> ${t("participants","مشاركين")} · ${esc(opt(D.goals).find(g => g[0] === el.value)[1])} · ${state.draft.dlang === "ar" ? "العربية" : "English"}`; }
  else if (el.id === "topic-sel"){ state.draft.topic = el.value; refreshHome(); }

  else if (el.dataset.lib){ state.lib[el.dataset.lib] = el.value; $("#lib-grid").innerHTML = libGridHTML(); }
});
document.addEventListener("keydown", e => {
  if (e.target.id === "hostmsg" && e.key === "Enter" && !e.shiftKey && !e.isComposing && !state.mention){ e.preventDefault(); sendHost(e.target.value); }
  else if (e.target.id === "q" && e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); assemble(); }
  else if (state.mention && e.target.id === "hostmsg" && ["ArrowDown","ArrowUp","Enter","Tab"].includes(e.key)){
    e.preventDefault(); const opts = [...document.querySelectorAll("#mention [data-act='to']")]; if (!opts.length) return;
    if (e.key === "ArrowDown") state.mention.k = (state.mention.k + 1) % opts.length; else if (e.key === "ArrowUp") state.mention.k = (state.mention.k - 1 + opts.length) % opts.length; else { opts[state.mention.k]?.click(); return; }
    renderMention();
  }
  else if (e.key !== "Escape" && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !state.modal && state.view === "discuss" && state.s){
    const k = e.key.toLowerCase();
    if (k === "n" && !state.busy){ e.preventDefault(); contribute(); }
    else if (/^[1-5]$/.test(k) && !state.busy && +k <= state.s.seats.length){ e.preventDefault(); contribute(+k - 1); }
    else if (k === "p" && !state.busy){ e.preventDefault(); autoplay(); }
    else if (k === "b" && !state.busy){ const c = state.s.messages.filter(m => m.type === "persona" && m.text).length; if (c >= state.s.seats.length){ e.preventDefault(); synthesize(false); } }
    else if (k === "/" || k === "@"){ e.preventDefault(); const box = $("#hostmsg"); box?.focus(); if (k === "@" && box){ box.value += "@"; box.dispatchEvent(new Event("input", { bubbles: true })); } }
    else if (k === "?"){ e.preventDefault(); state.modal = { kind: "keys" }; renderLayer(); }
  }
  else if (!e.ctrlKey && !e.metaKey && e.key === "?" && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !state.modal && state.view !== "welcome" && state.view !== "splash"){ e.preventDefault(); state.modal = { kind: "keys" }; renderLayer(); }
  else if (e.key === "Escape"){ if (state.mention){ state.mention = null; state.mentionRange = null; renderMention(); } else if (state.menu){ state.menu = ""; render(); } else if (state.modal && !(state.busy && state.modal.kind === "synth")){ state.modal = null; state.lib = null; renderLayer(); } else if (state.busy) stopAll(); }
});
document.addEventListener("submit", e => {
  if (e.target.id === "auth-form"){ e.preventDefault(); submitSiteAuth(); return; }
  if (e.target.id !== "custom-form") return; e.preventDefault();
  const name = $("#cf-name").value.trim(); if (!name) return;
  replaceSeat(state.lib.seat, { id: "custom-" + uid().slice(0, 8), type: "custom", name, ar: name, domain: "Custom", sub: "", tagline: $("#cf-pr").value.trim() || name, brief: $("#cf-bg").value.trim(), worldview: $("#cf-pv").value.trim(), values: $("#cf-pr").value.trim() });
});

/* ---------- safety net: never leave the controls frozen after an unexpected error ---------- */
function recoverFromError(err){
  const msg = String(err?.message || err?.reason?.message || err?.reason || err || "error").slice(0, 160);
  console.error("[council]", err);
  try { if (state.busy){ state.runId = (state.runId || 0) + 1; endBusy(); } state.autoplay = false; render(); } catch {}
  toast(t("Something went wrong: ","حدث خطأ: ") + msg, { kind: "err", ms: 9000 });
}
window.addEventListener("error", e => recoverFromError(e.error || e.message));
window.addEventListener("unhandledrejection", e => recoverFromError(e.reason));

/* ---------- boot ---------- */
render();
(async () => {
  const started = Date.now();
  const c = window.claude;
  const use = n => (c?.use ? c.use(n).catch(() => null) : Promise.resolve(null));
  const timeout = (p, ms, d) => Promise.race([p, new Promise(r => setTimeout(() => r(d), ms))]);
  // live AI: independent, upgrades the page whenever it arrives
  use("sample").then(x => { sample = x; resolveSample(x); state.capsSettled = true; syncMode(); });
  setTimeout(() => { if (!sample){ state.capsSettled = true; syncMode(); } }, 11000);
  use("downloads").then(x => { downloads = x; });
  const [usr, dbx] = await Promise.all([timeout(use("user"), 3500, null), timeout(use("db"), 3500, null)]);
  userCap = usr; db = dbx;
  if (userCap && !AUTH && !prefs.signedOut){ try { const me = await timeout(userCap.me(), 3000, null); if (me) state.me = { id: me.id, name: me.name || "", avatarUrl: me.avatarUrl || "" }; } catch {} }
  if (db && state.me.id) await timeout(loadRemote(), 4500);
  // late identity/storage: pick them up if they arrive after the first paint
  if (!userCap) use("user").then(async x => { if (!x || userCap) return; userCap = x; if (AUTH || prefs.signedOut){ refreshChrome(); return; } try { const me = await x.me(); if (me?.id){ state.me = { id: me.id, name: me.name || "", avatarUrl: me.avatarUrl || "" }; if (db) await loadRemote(); refreshChrome(); } } catch {} });
  if (!db) use("db").then(async x => { if (!x || db) return; db = x; if (state.me.id){ await loadRemote(); if (state.view === "home") render(); } });
  state.mode = computeMode();
  const wait = Math.max(0, 1300 - (Date.now() - started)); await new Promise(r => setTimeout(r, wait));
  if (AUTH) await timeout(AUTH.ready, 5000, null);
  state.view = authOn() && !signedSite() ? "welcome" : prefs.onboarded ? "home" : "welcome";
  render();
})();
})();
</script>

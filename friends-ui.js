/* The Council — private friends interface. Loaded after the app and friends client. */
(() => {
  "use strict";

  const API = () => window.COUNCIL_FRIENDS;
  const AUTH = () => window.COUNCIL_AUTH;
  const root = document.documentElement;
  const styleId = "council-friends-styles";
  let dialog = null;
  let current = null;
  let active = false;
  let busy = false;
  let refreshing = false;
  let draft = "";
  let notice = null;
  let error = null;
  let confirmAction = null;
  let refreshTimer = 0;
  let lastFocus = null;
  let signedInPreviously = false;
  let requestVersion = 0;

  const copy = {
    en: {
      title: "Friends", subtitle: "Private connections for better questions.",
      intro: "Friend requests come first. Nothing here is public, and no one is added without your say.",
      close: "Close friends", requests: "Requests for you", noneIncoming: "No requests waiting.",
      share: "Your friend code", shareHint: "Share it only with people you want to connect with.",
      copyCode: "Copy code", copied: "Code copied.", sendTitle: "Send a request",
      codeLabel: "Friend code", codePlaceholder: "AB12-CD34-EF56",
      send: "Send request", sending: "Sending…", noFriends: "Your circle starts with a conversation.",
      friends: "Your friends", outgoing: "Sent requests", noOutgoing: "No sent requests.",
      blocked: "Blocked", noBlocked: "No blocked accounts.", accept: "Accept", decline: "Decline",
      cancel: "Cancel request", remove: "Remove", block: "Block", unblock: "Unblock",
      loading: "Loading your private connections…", loadingTitle: "Opening your circle",
      retry: "Try again", signIn: "Sign in to manage private connections.",
      signInHint: "Friend codes connect accounts without exposing email addresses.",
      loadError: "We couldn't load your friends. Please try again.",
      errorFallback: "That didn't work. Please try again.",
      invalid_code: "Enter a valid 12-character friend code.",
      friend_not_available: "That code isn't available. Check it and try again.",
      self_request: "That's your own friend code.",
      already_friends: "You're already friends.",
      request_exists: "A request is already waiting for this person.",
      request_received: "They already sent you a request. Accept it above.",
      not_pending: "That request is no longer pending. Refresh and try again.",
      not_friend: "That connection is no longer active.",
      limit_reached: "This account has reached its friends limit.",
      rate_limited: "Too many requests. Wait a little and try again.",
      signin_required: "Please sign in again to manage friends.",
      invalid_request: "That request could not be completed.",
      server_error: "Friends are temporarily unavailable. Please try again.",
      sent: "Friend request sent.", accepted: "Request accepted.", declined: "Request declined.",
      cancelled: "Request cancelled.", removed: "Friend removed.", blockedSuccess: "Account blocked.",
      unblocked: "Account unblocked.", refresh: "Updated just now",
      confirmTitle: "Are you sure?", confirmDecline: "Decline this friend request?",
      confirmCancel: "Cancel this outgoing request?", confirmRemove: "Remove this friend?",
      confirmBlock: "Block this account? They will no longer be able to connect with you.",
      confirmYes: "Confirm", keep: "Keep", actions: "Actions", working: "Working…",
      codeCopiedFallback: "Copy this code to share it.", privacy: "Your friends list is private.",
      friendsCount: "connections", incomingCount: "waiting", requestCount: "sent",
      sectionNote: "Only people with your code can ask to connect."
    },
    ar: {
      title: "الأصدقاء", subtitle: "روابط خاصة لأسئلة أفضل.",
      intro: "طلبات الصداقة أولاً. لا شيء هنا عام، ولا يُضاف أحد من دون موافقتك.",
      close: "إغلاق الأصدقاء", requests: "طلبات بانتظارك", noneIncoming: "لا توجد طلبات بانتظارك.",
      share: "رمز الصداقة الخاص بك", shareHint: "شاركه فقط مع من ترغب في التواصل معهم.",
      copyCode: "نسخ الرمز", copied: "تم نسخ الرمز.", sendTitle: "إرسال طلب",
      codeLabel: "رمز الصداقة", codePlaceholder: "AB12-CD34-EF56",
      send: "إرسال الطلب", sending: "جارٍ الإرسال…", noFriends: "تبدأ دائرتك بمحادثة.",
      friends: "أصدقاؤك", outgoing: "الطلبات المرسلة", noOutgoing: "لا توجد طلبات مرسلة.",
      blocked: "المحظورون", noBlocked: "لا توجد حسابات محظورة.", accept: "قبول", decline: "رفض",
      cancel: "إلغاء الطلب", remove: "إزالة", block: "حظر", unblock: "إلغاء الحظر",
      loading: "جارٍ تحميل روابطك الخاصة…", loadingTitle: "جارٍ فتح دائرتك",
      retry: "حاول مجدداً", signIn: "سجّل الدخول لإدارة روابطك الخاصة.",
      signInHint: "تربط رموز الصداقة الحسابات من دون كشف عناوين البريد الإلكتروني.",
      loadError: "تعذّر تحميل أصدقائك. حاول مجدداً.",
      errorFallback: "تعذّر إتمام ذلك. حاول مجدداً.",
      invalid_code: "أدخل رمز صداقة صالحاً من 12 خانة.",
      friend_not_available: "هذا الرمز غير متاح. تحقّق منه وحاول مجدداً.",
      self_request: "هذا رمز الصداقة الخاص بك.",
      already_friends: "أنتما صديقان بالفعل.",
      request_exists: "هناك طلب بانتظار هذا الشخص بالفعل.",
      request_received: "لقد أرسل إليك طلباً بالفعل. اقبله أعلاه.",
      not_pending: "لم يعد هذا الطلب معلّقاً. حدّث القائمة وحاول مجدداً.",
      not_friend: "لم يعد هذا الاتصال نشطاً.",
      limit_reached: "بلغ هذا الحساب الحد الأقصى للأصدقاء.",
      rate_limited: "طلبات كثيرة جداً. انتظر قليلاً ثم حاول مجدداً.",
      signin_required: "سجّل الدخول مجدداً لإدارة الأصدقاء.",
      invalid_request: "تعذّر إتمام هذا الطلب.",
      server_error: "خدمة الأصدقاء غير متاحة مؤقتاً. حاول مجدداً.",
      sent: "تم إرسال طلب الصداقة.", accepted: "تم قبول الطلب.", declined: "تم رفض الطلب.",
      cancelled: "تم إلغاء الطلب.", removed: "تمت إزالة الصديق.", blockedSuccess: "تم حظر الحساب.",
      unblocked: "تم إلغاء حظر الحساب.", refresh: "تم التحديث للتو",
      confirmTitle: "هل أنت متأكد؟", confirmDecline: "هل تريد رفض طلب الصداقة؟",
      confirmCancel: "هل تريد إلغاء هذا الطلب المرسل؟", confirmRemove: "هل تريد إزالة هذا الصديق؟",
      confirmBlock: "هل تريد حظر هذا الحساب؟ لن يتمكن من التواصل معك بعد ذلك.",
      confirmYes: "تأكيد", keep: "تراجع", actions: "الإجراءات", working: "جارٍ التنفيذ…",
      codeCopiedFallback: "انسخ هذا الرمز لمشاركته.", privacy: "قائمة أصدقائك خاصة.",
      friendsCount: "اتصالات", incomingCount: "بانتظارك", requestCount: "مرسلة",
      sectionNote: "يمكن فقط لمن لديه رمزك أن يطلب التواصل."
    }
  };

  const isArabic = () => (root.lang || document.body?.lang || "").toLowerCase().startsWith("ar");
  const t = key => (copy[isArabic() ? "ar" : "en"][key] || copy.en[key] || key);
  const escapeHTML = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
  const signedIn = () => !!(AUTH() && AUTH().state && AUTH().state.signedIn);
  const icon = (name) => {
    const paths = {
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
      arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
      person: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
      lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      plus: '<path d="M12 5v14M5 12h14"/>'
    };
    return `<svg class="cfr-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
  };

  function addStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .cfr-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(8,13,10,.56);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);animation:cfrFade .18s ease both}
      .cfr-dialog{--cfr-bg:var(--bg,#F1F2ED);--cfr-surface:var(--surface,#fff);--cfr-surface2:var(--surface-2,#F7F8F4);--cfr-ink:var(--ink,#131715);--cfr-ink2:var(--ink-2,#39403C);--cfr-muted:var(--muted,#5F6862);--cfr-faint:var(--faint,#858D88);--cfr-line:var(--line,#DFE2DA);--cfr-strong:var(--line-strong,#C6CBC2);--cfr-green:var(--green,#0E7C5A);--cfr-greenink:var(--green-ink,#fff);--cfr-soft:var(--green-soft,#E1F0E9);--cfr-brand:var(--brand,#C9522D);--cfr-danger:var(--err-ink,#9C2A16);--cfr-dangerbg:var(--err-soft,#FCE8E4);font:14px/1.5 var(--sans,"Schibsted Grotesk",system-ui,sans-serif);color:var(--cfr-ink2);background:var(--cfr-bg);border:1px solid var(--cfr-line);border-radius:22px;box-shadow:var(--shadow-lg,0 24px 70px rgba(10,20,15,.22));width:min(900px,100%);max-height:min(92dvh,900px);display:flex;flex-direction:column;overflow:hidden;animation:cfrRise .22s cubic-bezier(.2,.7,.2,1) both}
      .cfr-dialog[dir="rtl"]{font-family:var(--ar-sans,"IBM Plex Sans Arabic",Tahoma,sans-serif);font-size:15px}
      .cfr-dialog *{box-sizing:border-box}.cfr-dialog button,.cfr-dialog input{font:inherit;color:inherit}.cfr-dialog button{cursor:pointer}
      .cfr-dialog button:focus-visible,.cfr-dialog input:focus-visible{outline:2px solid var(--cfr-green);outline-offset:3px}
      .cfr-icon{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .cfr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .cfr-head{display:flex;align-items:flex-start;gap:18px;padding:23px 28px 19px;border-bottom:1px solid var(--cfr-line);background:var(--cfr-surface)}
      .cfr-headcopy{min-width:0;flex:1}.cfr-kicker{margin:0 0 5px;color:var(--cfr-brand);font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}
      .cfr-dialog[dir="rtl"] .cfr-kicker{letter-spacing:0;font-size:13px}
      .cfr-head h1{font:400 clamp(25px,3vw,34px)/1.1 var(--serif,"Newsreader",Georgia,serif);letter-spacing:-.02em;color:var(--cfr-ink);margin:0}
      .cfr-dialog[dir="rtl"] .cfr-head h1{font-family:var(--ar-serif,"Noto Naskh Arabic",serif);line-height:1.45;letter-spacing:0;font-weight:600}
      .cfr-subtitle{margin:5px 0 0;color:var(--cfr-muted);font-size:13px}
      .cfr-close{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--cfr-line);border-radius:50%;background:var(--cfr-surface2);color:var(--cfr-muted);flex:none;transition:background .15s,transform .15s}
      .cfr-close:hover{background:var(--cfr-line);transform:rotate(4deg)}
      .cfr-body{overflow:auto;padding:22px 28px 28px;overscroll-behavior:contain}
      .cfr-intro{display:flex;align-items:flex-start;gap:12px;padding:13px 15px;border:1px solid var(--cfr-line);border-radius:13px;background:var(--cfr-surface2);color:var(--cfr-muted);font-size:13px;margin-bottom:18px}
      .cfr-intro .cfr-icon{color:var(--cfr-green);margin-top:1px}.cfr-intro p{margin:0}
      .cfr-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(260px,.92fr);gap:18px;align-items:start}
      .cfr-primary{display:flex;flex-direction:column;gap:18px;min-width:0}
      .cfr-panel{background:var(--cfr-surface);border:1px solid var(--cfr-line);border-radius:16px;padding:17px 18px;min-width:0;box-shadow:var(--shadow-sm,0 1px 2px rgba(20,30,25,.06))}
      .cfr-panel.request-panel{border-top:3px solid var(--cfr-brand);padding-top:15px}
      .cfr-panel-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}
      .cfr-panel-head h2{font:500 18px/1.25 var(--serif,"Newsreader",Georgia,serif);color:var(--cfr-ink);margin:0}
      .cfr-dialog[dir="rtl"] .cfr-panel-head h2{font-family:var(--ar-serif,"Noto Naskh Arabic",serif);font-weight:600}
      .cfr-count{margin-inline-start:auto;background:var(--cfr-surface2);border:1px solid var(--cfr-line);border-radius:99px;padding:2px 8px;color:var(--cfr-muted);font-size:11px;white-space:nowrap}
      .cfr-empty{display:flex;align-items:center;gap:11px;min-height:58px;padding:10px 12px;border:1px dashed var(--cfr-strong);border-radius:12px;color:var(--cfr-muted);font-size:13px}
      .cfr-empty .cfr-icon{color:var(--cfr-faint)}
      .cfr-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column}
      .cfr-item{display:flex;align-items:center;gap:11px;padding:11px 1px;min-width:0}
      .cfr-item+.cfr-item{border-top:1px solid var(--cfr-line)}
      .cfr-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--cfr-soft);color:var(--cfr-green);font-weight:700;font-size:13px;letter-spacing:.03em}
      .cfr-name{font-weight:600;color:var(--cfr-ink);overflow-wrap:anywhere;min-width:0;flex:1}
      .cfr-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .cfr-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:1px solid var(--cfr-strong);border-radius:999px;background:var(--cfr-surface);color:var(--cfr-ink);padding:6px 11px;font-size:12px;font-weight:600;line-height:1.15;transition:background .15s,border-color .15s,transform .12s}
      .cfr-btn:hover{border-color:var(--cfr-ink2);background:var(--cfr-surface2)}.cfr-btn:active{transform:translateY(1px)}
      .cfr-btn.primary{background:var(--cfr-green);border-color:var(--cfr-green);color:var(--cfr-greenink)}
      .cfr-btn.primary:hover{filter:brightness(.94)}
      .cfr-btn.quiet{background:transparent;border-color:transparent;color:var(--cfr-muted)}
      .cfr-btn.quiet:hover{background:var(--cfr-surface2);border-color:var(--cfr-line)}
      .cfr-btn.danger{color:var(--cfr-danger)}.cfr-btn.danger:hover{background:var(--cfr-dangerbg);border-color:transparent}
      .cfr-code-panel{background:var(--chamber,#121614);border-color:var(--chamber-line,#2A322E);color:var(--chamber-ink,#EEF1EE);padding:19px;position:relative;overflow:hidden}
      .cfr-code-panel:after{content:"";position:absolute;width:190px;height:190px;border:1px solid color-mix(in srgb,var(--chamber-ink,#EEF1EE) 12%,transparent);border-radius:50%;inset-inline-end:-80px;top:-112px;pointer-events:none}
      .cfr-code-panel .cfr-panel-head h2{color:var(--chamber-ink,#EEF1EE)}.cfr-code-panel .cfr-panel-head{position:relative;z-index:1}
      .cfr-code-panel .cfr-muted{color:var(--chamber-muted,#9BA59F)}
      .cfr-code-display{font:500 clamp(20px,3vw,27px)/1.2 ui-monospace,"IBM Plex Mono",monospace;letter-spacing:.1em;direction:ltr;text-align:start;color:var(--chamber-ink,#EEF1EE);margin:13px 0 6px;overflow-wrap:anywhere}
      .cfr-code-note{margin:0;color:var(--chamber-muted,#9BA59F);font-size:12px;max-width:40ch}
      .cfr-dialog .cfr-copy{margin-top:16px;background:var(--chamber-ink,#EEF1EE);color:var(--chamber,#121614);border-color:transparent}
      .cfr-dialog .cfr-copy:hover{background:var(--cfr-green);color:var(--cfr-greenink);border-color:transparent}
      .cfr-form{display:flex;gap:8px;align-items:stretch;margin-top:12px}
      .cfr-field{min-width:0;flex:1}.cfr-field label{display:block;color:var(--cfr-muted);font-size:12px;font-weight:600;margin-bottom:6px}
      .cfr-input{width:100%;min-height:42px;border:1px solid var(--cfr-strong);background:var(--cfr-bg);border-radius:10px;padding:9px 11px;font:600 14px ui-monospace,monospace!important;letter-spacing:.055em;text-transform:uppercase;direction:ltr;text-align:start}
      .cfr-input::placeholder{color:var(--cfr-faint);opacity:.8}
      .cfr-form .cfr-btn{align-self:end;min-height:42px}
      .cfr-help{margin:8px 0 0;color:var(--cfr-faint);font-size:11.5px}
      .cfr-secondary{display:grid;gap:14px}
      .cfr-secondary .cfr-panel{padding:15px 16px}
      .cfr-secondary .cfr-panel-head{margin-bottom:6px}
      .cfr-secondary .cfr-panel-head h2{font-size:16px}
      .cfr-secondary .cfr-item{padding:9px 0}
      .cfr-secondary .cfr-avatar{width:32px;height:32px;font-size:11px}
      .cfr-secondary .cfr-btn{min-height:31px;padding:5px 9px}
      .cfr-status{border-radius:11px;padding:11px 13px;margin:0 0 15px;display:flex;align-items:flex-start;gap:9px;font-size:13px}
      .cfr-status.success{background:var(--cfr-soft);color:var(--cfr-green);border:1px solid color-mix(in srgb,var(--cfr-green) 22%,transparent)}
      .cfr-status.error{background:var(--cfr-dangerbg);color:var(--cfr-danger);border:1px solid color-mix(in srgb,var(--cfr-danger) 20%,transparent)}
      .cfr-status p{margin:0;flex:1}
      .cfr-loading{display:grid;grid-template-columns:1fr .75fr;gap:18px}
      .cfr-skeleton{height:88px;border-radius:15px;background:linear-gradient(100deg,var(--cfr-surface2) 20%,var(--cfr-line) 42%,var(--cfr-surface2) 64%);background-size:250% 100%;animation:cfrShimmer 1.5s linear infinite}
      .cfr-skeleton.tall{height:190px}.cfr-loading-stack{display:grid;gap:12px}
      .cfr-gate{max-width:540px;margin:0 auto;text-align:center;padding:48px 20px 56px}
      .cfr-gate-mark{width:56px;height:56px;border-radius:18px;background:var(--cfr-soft);color:var(--cfr-green);display:grid;place-items:center;margin:0 auto 16px}
      .cfr-gate-mark .cfr-icon{width:24px;height:24px}
      .cfr-gate h2{font:400 25px/1.2 var(--serif,"Newsreader",Georgia,serif);color:var(--cfr-ink);margin:0 0 9px}
      .cfr-dialog[dir="rtl"] .cfr-gate h2{font-family:var(--ar-serif,"Noto Naskh Arabic",serif);font-weight:600}
      .cfr-gate p{margin:0 auto;color:var(--cfr-muted);max-width:42ch}
      .cfr-gate .cfr-btn{margin-top:20px}
      .cfr-confirm{position:fixed;inset:0;z-index:2;display:grid;place-items:center;padding:20px;background:rgba(8,13,10,.48)}
      .cfr-confirm-card{width:min(390px,100%);background:var(--cfr-surface);border:1px solid var(--cfr-line);border-radius:18px;padding:22px;box-shadow:var(--shadow-lg);animation:cfrRise .16s ease both}
      .cfr-confirm-card h2{font:500 20px var(--serif,"Newsreader",Georgia,serif);color:var(--cfr-ink);margin:0 0 8px}
      .cfr-confirm-card p{color:var(--cfr-muted);margin:0 0 20px}
      .cfr-confirm-actions{display:flex;justify-content:flex-end;gap:8px}
      .cfr-foot{display:flex;align-items:center;gap:7px;color:var(--cfr-faint);font-size:11.5px;margin-top:15px}
      .cfr-foot .cfr-icon{width:14px;height:14px;color:var(--cfr-green)}
      .cfr-dialog[aria-busy="true"] .cfr-btn{cursor:wait}
      @keyframes cfrFade{from{opacity:0}to{opacity:1}}@keyframes cfrRise{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}
      @keyframes cfrShimmer{to{background-position:-250% 0}}
       @media(max-width:680px){.cfr-overlay{padding:0;place-items:end center}.cfr-dialog{width:100%;max-height:96dvh;border-radius:20px 20px 0 0;border-bottom:0}.cfr-head{padding:19px 18px 15px}.cfr-close{width:44px;height:44px}.cfr-body{padding:16px 16px max(22px,env(safe-area-inset-bottom))}.cfr-grid{grid-template-columns:1fr}.cfr-primary{gap:13px}.cfr-secondary{grid-template-columns:1fr 1fr;align-items:start}.cfr-secondary .cfr-panel{height:100%}.cfr-code-panel{order:0}.cfr-primary .request-panel{order:1}.cfr-form{flex-wrap:wrap}.cfr-form .cfr-field{flex-basis:100%}.cfr-form .cfr-btn{width:100%}.cfr-dialog .cfr-btn{min-height:44px;padding-block:9px}.cfr-dialog .cfr-secondary .cfr-btn{min-height:44px;padding-block:9px}.cfr-panel{padding:15px}.cfr-item{align-items:flex-start;flex-wrap:wrap}.cfr-item .cfr-name{padding-top:8px}.cfr-item .cfr-actions{width:100%;padding-inline-start:49px;gap:8px}.cfr-secondary .cfr-item .cfr-actions{padding-inline-start:0}.cfr-count{font-size:10px}}
      @media(max-width:420px){.cfr-secondary{grid-template-columns:1fr}.cfr-secondary .cfr-panel{height:auto}.cfr-item .cfr-actions{padding-inline-start:0}.cfr-dialog{font-size:13.5px}.cfr-dialog[dir="rtl"]{font-size:14.5px}}
      @media(prefers-reduced-motion:reduce){.cfr-overlay,.cfr-dialog,.cfr-confirm-card,.cfr-skeleton{animation:none!important}.cfr-btn,.cfr-close{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function formatCode(code) {
    const cleaned = String(code || "").replace(/[^a-f0-9]/gi, "").toUpperCase().slice(0, 12);
    return cleaned.match(/.{1,4}/g)?.join("-") || "";
  }
  function initials(name) {
    const bits = String(name || "?").trim().split(/\s+/).filter(Boolean);
    return (bits.length > 1 ? bits[0][0] + bits[bits.length - 1][0] : bits[0].slice(0, 2)).toLocaleUpperCase();
  }
  function errorText(err) {
    if (err && err.code && copy[isArabic() ? "ar" : "en"][err.code]) return t(err.code);
    return err?.code === "signin_required" ? t("signin_required") : t("errorFallback");
  }
  function listSection(key, items, emptyKey, type) {
    const label = t(key);
    return `<section class="cfr-panel" aria-labelledby="cfr-${type}-title">
      <div class="cfr-panel-head"><h2 id="cfr-${type}-title">${escapeHTML(label)}</h2><span class="cfr-count">${items.length}</span></div>
      ${items.length ? `<ul class="cfr-list">${items.map(item => rowHTML(item, type)).join("")}</ul>` : `<div class="cfr-empty">${icon("person")}<span>${escapeHTML(t(emptyKey))}</span></div>`}
    </section>`;
  }
  function rowHTML(item, type) {
    const safeName = escapeHTML(item.name || "");
    const id = escapeHTML(item.id);
    let actions = "";
    if (type === "incoming") actions = `<button class="cfr-btn primary" data-friends-action="accept" data-id="${id}" ${busy ? "disabled" : ""}>${icon("check")}${escapeHTML(t("accept"))}</button><button class="cfr-btn quiet" data-friends-confirm="decline" data-id="${id}" ${busy ? "disabled" : ""}>${escapeHTML(t("decline"))}</button>`;
    if (type === "outgoing") actions = `<button class="cfr-btn quiet" data-friends-confirm="cancel" data-id="${id}" ${busy ? "disabled" : ""}>${escapeHTML(t("cancel"))}</button>`;
    if (type === "friend") actions = `<button class="cfr-btn quiet" data-friends-confirm="remove" data-id="${id}" ${busy ? "disabled" : ""}>${escapeHTML(t("remove"))}</button><button class="cfr-btn danger" data-friends-confirm="block" data-id="${id}" ${busy ? "disabled" : ""}>${escapeHTML(t("block"))}</button>`;
    if (type === "blocked") actions = `<button class="cfr-btn quiet" data-friends-action="unblock" data-id="${id}" ${busy ? "disabled" : ""}>${escapeHTML(t("unblock"))}</button>`;
    return `<li class="cfr-item"><span class="cfr-avatar" aria-hidden="true">${escapeHTML(initials(item.name))}</span><span class="cfr-name">${safeName}</span><div class="cfr-actions">${actions}</div></li>`;
  }
  function codePanel() {
    const code = formatCode(current?.profile?.code);
    return `<section class="cfr-panel cfr-code-panel" aria-labelledby="cfr-code-title">
      <div class="cfr-panel-head"><h2 id="cfr-code-title">${escapeHTML(t("share"))}</h2></div>
      <p class="cfr-code-display" dir="ltr">${escapeHTML(code || "—")}</p>
      <p class="cfr-code-note">${escapeHTML(t("shareHint"))}</p>
      <button class="cfr-btn cfr-copy" data-friends-action="copy" ${!code || busy ? "disabled" : ""}>${icon("copy")}${escapeHTML(t("copyCode"))}</button>
    </section>`;
  }
  function sendPanel() {
    return `<section class="cfr-panel request-panel" aria-labelledby="cfr-send-title">
      <div class="cfr-panel-head"><h2 id="cfr-send-title">${escapeHTML(t("sendTitle"))}</h2></div>
      <form class="cfr-form" data-friends-form novalidate>
        <div class="cfr-field"><label for="cfr-code-input">${escapeHTML(t("codeLabel"))}</label>
          <input class="cfr-input" id="cfr-code-input" name="friend-code" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14" placeholder="${escapeHTML(t("codePlaceholder"))}" value="${escapeHTML(draft)}" ${busy ? "disabled" : ""}>
        </div>
        <button class="cfr-btn primary" type="submit" ${busy ? "disabled" : ""}>${busy ? escapeHTML(t("sending")) : `${escapeHTML(t("send"))}${icon("arrow")}`}</button>
      </form><p class="cfr-help">${escapeHTML(t("sectionNote"))}</p>
    </section>`;
  }
  function render() {
    if (!dialog) return;
    const prev = document.activeElement;
    const focusId = prev?.id || "";
    const focusAction = prev?.getAttribute?.("data-friends-action") || "";
    const focusConfirm = prev?.getAttribute?.("data-friends-confirm") || "";
    const focusItemId = prev?.getAttribute?.("data-id") || "";
    const inputFocused = prev?.id === "cfr-code-input";
    const selection = inputFocused ? [prev.selectionStart, prev.selectionEnd] : null;
    const currentScroll = dialog.querySelector(".cfr-body")?.scrollTop || 0;
    const status = error ? `<div class="cfr-status error" role="alert">${icon("close")}<p>${escapeHTML(error)}</p>${error === t("loadError") ? `<button class="cfr-btn" data-friends-action="retry">${escapeHTML(t("retry"))}</button>` : ""}</div>`
      : notice ? `<div class="cfr-status success" role="status" aria-live="polite">${icon("check")}<p>${escapeHTML(notice)}</p></div>` : "";
    let body;
    if (!signedIn()) {
      body = `<div class="cfr-gate"><span class="cfr-gate-mark">${icon("lock")}</span><h2>${escapeHTML(t("signIn"))}</h2><p>${escapeHTML(t("signInHint"))}</p></div>`;
    } else if (!current && error) {
      body = `${status}<div class="cfr-empty">${icon("refresh")}<span>${escapeHTML(t("loadError"))}</span></div>`;
    } else if (!current) {
      body = `<div class="cfr-loading" aria-label="${escapeHTML(t("loadingTitle"))}" aria-busy="true"><div class="cfr-loading-stack"><div class="cfr-skeleton"></div><div class="cfr-skeleton tall"></div></div><div class="cfr-loading-stack"><div class="cfr-skeleton"></div><div class="cfr-skeleton"></div></div><span class="cfr-sr">${escapeHTML(t("loading"))}</span></div>`;
    } else {
      const incoming = Array.isArray(current.incoming) ? current.incoming : [];
      const friends = Array.isArray(current.friends) ? current.friends : [];
      const outgoing = Array.isArray(current.outgoing) ? current.outgoing : [];
      const blocked = Array.isArray(current.blocked) ? current.blocked : [];
      body = `${status}<div class="cfr-intro">${icon("lock")}<p>${escapeHTML(t("intro"))}</p></div>
        <div class="cfr-grid"><div class="cfr-primary">
          ${listSection("requests", incoming, "noneIncoming", "incoming")}
          ${codePanel()}${sendPanel()}
          ${listSection("friends", friends, "noFriends", "friend")}
        </div><div class="cfr-secondary">
          ${listSection("outgoing", outgoing, "noOutgoing", "outgoing")}
          ${listSection("blocked", blocked, "noBlocked", "blocked")}
        </div></div>
        <div class="cfr-foot">${icon("lock")}<span>${escapeHTML(t("privacy"))}</span><span aria-live="polite">${escapeHTML(refreshing ? t("loading") : "")}</span></div>`;
    }
    dialog.innerHTML = `<div class="cfr-head"><div class="cfr-headcopy"><p class="cfr-kicker">The Council · ${escapeHTML(t("title"))}</p><h1 id="cfr-title">${escapeHTML(t("title"))}</h1><p class="cfr-subtitle">${escapeHTML(t("subtitle"))}</p></div><button class="cfr-close" type="button" data-friends-action="close" aria-label="${escapeHTML(t("close"))}">${icon("close")}</button></div>
      <div class="cfr-body">${body}</div>${confirmAction ? confirmHTML() : ""}`;
    dialog.setAttribute("aria-busy", busy ? "true" : "false");
    dialog.setAttribute("dir", isArabic() ? "rtl" : "ltr");
    const scroll = dialog.querySelector(".cfr-body");
    if (scroll) scroll.scrollTop = currentScroll;
    let focusTarget = inputFocused ? dialog.querySelector("#cfr-code-input") : null;
    if (!focusTarget && focusId) focusTarget = dialog.querySelector(`#${CSS.escape(focusId)}`);
    if (!focusTarget && focusAction) {
      const actionSelector = `[data-friends-action="${CSS.escape(focusAction)}"]`;
      focusTarget = focusItemId
        ? dialog.querySelector(`${actionSelector}[data-id="${CSS.escape(focusItemId)}"]`)
        : dialog.querySelector(actionSelector);
    }
    if (!focusTarget && focusConfirm) {
      focusTarget = dialog.querySelector(`[data-friends-confirm="${CSS.escape(focusConfirm)}"][data-id="${CSS.escape(focusItemId)}"]`);
    }
    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
      if (inputFocused && selection) focusTarget.setSelectionRange(selection[0], selection[1]);
    }
  }
  function confirmHTML() {
    const key = `confirm${confirmAction.type[0].toUpperCase()}${confirmAction.type.slice(1)}`;
    const messageKeys = { decline: "confirmDecline", cancel: "confirmCancel", remove: "confirmRemove", block: "confirmBlock" };
    return `<div class="cfr-confirm" data-confirm-layer><section class="cfr-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="cfr-confirm-title" aria-describedby="cfr-confirm-copy" tabindex="-1">
      <h2 id="cfr-confirm-title">${escapeHTML(t("confirmTitle"))}</h2><p id="cfr-confirm-copy">${escapeHTML(t(messageKeys[confirmAction.type] || key))}</p>
      <div class="cfr-confirm-actions"><button class="cfr-btn" data-friends-action="dismiss-confirm">${escapeHTML(t("keep"))}</button><button class="cfr-btn danger" data-friends-action="confirm" ${busy ? "disabled" : ""}>${busy ? escapeHTML(t("working")) : escapeHTML(t("confirmYes"))}</button></div>
    </section></div>`;
  }
  function open() {
    if (active) return;
    requestVersion++;
    addStyles();
    active = true;
    lastFocus = document.activeElement;
    current = null;
    error = null;
    notice = null;
    draft = "";
    busy = false;
    dialog = document.createElement("section");
    dialog.className = "cfr-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "cfr-title");
    dialog.setAttribute("tabindex", "-1");
    dialog.setAttribute("dir", isArabic() ? "rtl" : "ltr");
    const overlay = document.createElement("div");
    overlay.className = "cfr-overlay";
    overlay.dataset.friendsOverlay = "true";
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    render();
    if (signedIn()) loadInitial();
    requestAnimationFrame(() => dialog?.querySelector(".cfr-close")?.focus());
  }
  function close() {
    if (!active) return;
    requestVersion++;
    active = false;
    clearInterval(refreshTimer);
    refreshTimer = 0;
    current = null;
    draft = "";
    notice = null;
    error = null;
    confirmAction = null;
    busy = false;
    const overlay = document.querySelector("[data-friends-overlay]");
    overlay?.remove();
    dialog = null;
    document.body.style.overflow = "";
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }
  async function loadInitial() {
    const version = ++requestVersion;
    render();
    try {
      const data = await API().load();
      if (!active || !signedIn() || version !== requestVersion) return;
      current = data;
      error = null;
      render();
      clearInterval(refreshTimer);
      refreshTimer = setInterval(refreshQuietly, 10000);
    } catch (err) {
      if (!active || version !== requestVersion) return;
      error = err?.code === "signin_required" ? t("signin_required") : t("loadError");
      render();
    }
  }
  async function refreshQuietly() {
    if (!active || !signedIn() || busy || refreshing) return;
    const version = requestVersion;
    refreshing = true;
    try {
      const latest = await API().load();
      if (!active || !signedIn() || busy || version !== requestVersion) return;
      current = latest;
      error = null;
      refreshing = false;
      render();
    } catch (err) {
      if (!active || version !== requestVersion) return;
      if (err?.code === "signin_required") {
        clearPrivateAndClose();
        return;
      }
      error = t("server_error");
      refreshing = false;
      render();
    } finally {
      refreshing = false;
    }
  }
  function clearPrivateAndClose() {
    current = null;
    draft = "";
    notice = null;
    error = null;
    close();
  }
  function updateFrom(response, successText) {
    if (response && typeof response === "object" && response.profile) current = response;
    error = null;
    notice = successText;
  }
  async function runMutation(method, id, successText) {
    if (busy || !signedIn()) return;
    const version = ++requestVersion;
    busy = true;
    error = null;
    notice = null;
    render();
    try {
      const result = await API()[method](id);
      if (!active || !signedIn() || version !== requestVersion) return;
      updateFrom(result, successText);
      confirmAction = null;
      busy = false;
      render();
    } catch (err) {
      if (!active || version !== requestVersion) return;
      if (err?.code === "signin_required") {
        clearPrivateAndClose();
        return;
      }
      error = errorText(err);
      busy = false;
      render();
    }
  }
  async function sendRequest() {
    const raw = draft.replace(/[^a-f0-9]/gi, "").toUpperCase();
    if (raw.length !== 12) {
      error = t("invalid_code");
      notice = null;
      render();
      dialog?.querySelector("#cfr-code-input")?.focus();
      return;
    }
    if (busy || !signedIn()) return;
    const version = ++requestVersion;
    busy = true;
    error = null;
    notice = null;
    render();
    try {
      const result = await API().send(raw);
      if (!active || !signedIn() || version !== requestVersion) return;
      draft = "";
      updateFrom(result, t("sent"));
      busy = false;
      render();
    } catch (err) {
      if (!active || version !== requestVersion) return;
      if (err?.code === "signin_required") {
        clearPrivateAndClose();
        return;
      }
      error = errorText(err);
      busy = false;
      render();
      dialog?.querySelector("#cfr-code-input")?.focus();
    }
  }
  async function copyCode() {
    const version = requestVersion;
    const code = formatCode(current?.profile?.code);
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      if (!active || version !== requestVersion) return;
      notice = t("copied");
    } catch {
      if (!active || version !== requestVersion) return;
      notice = `${t("codeCopiedFallback")} ${code}`;
    }
    error = null;
    render();
  }
  function focusables() {
    const scope = dialog?.querySelector(".cfr-confirm-card") || dialog;
    return [...(scope?.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])]
      .filter(el => !el.closest("[hidden]") && el.getClientRects().length);
  }

  document.addEventListener("click", event => {
    const openButton = event.target.closest("[data-friends-open]");
    if (openButton) {
      event.preventDefault();
      open();
      return;
    }
    if (!active) return;
    const actionButton = event.target.closest("[data-friends-action],[data-friends-confirm]");
    if (!actionButton || !dialog?.contains(actionButton)) {
      if (event.target.matches("[data-friends-overlay]")) close();
      return;
    }
    const id = actionButton.dataset.id;
    const confirm = actionButton.dataset.friendsConfirm;
    if (confirm) {
      confirmAction = { type: confirm, id };
      render();
      dialog?.querySelector(".cfr-confirm-card")?.focus();
      return;
    }
    switch (actionButton.dataset.friendsAction) {
      case "close": close(); break;
      case "dismiss-confirm": confirmAction = null; render(); break;
      case "confirm": {
        if (!confirmAction) return;
        const pending = confirmAction;
        const methodMap = { decline: ["decline", "declined"], cancel: ["cancel", "cancelled"], remove: ["remove", "removed"], block: ["block", "blockedSuccess"] };
        const [method, message] = methodMap[pending.type] || [];
        if (method) runMutation(method, pending.id, t(message));
        break;
      }
      case "accept": runMutation("accept", id, t("accepted")); break;
      case "unblock": runMutation("unblock", id, t("unblocked")); break;
      case "copy": copyCode(); break;
      case "retry": loadInitial(); break;
    }
  });
  document.addEventListener("input", event => {
    if (event.target?.id !== "cfr-code-input") return;
    const input = event.target;
    const start = input.selectionStart;
    const raw = input.value.replace(/[^a-f0-9]/gi, "").toUpperCase().slice(0, 12);
    draft = raw.match(/.{1,4}/g)?.join("-") || "";
    if (input.value !== draft) {
      input.value = draft;
      const nextPos = Math.min(draft.length, start + (draft.length > start && draft[start - 1] !== "-" ? 0 : 1));
      input.setSelectionRange(nextPos, nextPos);
    }
  });
  document.addEventListener("submit", event => {
    if (!event.target.matches("[data-friends-form]")) return;
    event.preventDefault();
    sendRequest();
  });
  document.addEventListener("keydown", event => {
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (confirmAction) { confirmAction = null; render(); }
      else close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusList = focusables();
    if (!focusList.length) {
      event.preventDefault();
      dialog?.focus();
      return;
    }
    const first = focusList[0], last = focusList[focusList.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  window.addEventListener("council-auth", () => {
    const nowSignedIn = signedIn();
    if (!nowSignedIn) {
      current = null;
      draft = "";
      notice = null;
      error = null;
      if (active) close();
    } else if (active && !current) {
      loadInitial();
    }
    signedInPreviously = nowSignedIn;
  });
  const langObserver = new MutationObserver(() => { if (active) render(); });
  langObserver.observe(root, { attributes: true, attributeFilter: ["lang"] });
  signedInPreviously = signedIn();
})();

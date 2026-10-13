/* Private, deliberately shared discussion snapshots. Loaded after the Council app. */
(() => {
  "use strict";
  const AUTH = () => window.COUNCIL_AUTH;
  const FRIENDS = () => window.COUNCIL_FRIENDS;
  const root = document.documentElement;
  const API = "/api/shares";
  const words = {
    en: {
      title:"Shared snapshots", subtitle:"Conclusions shared deliberately, with people you trust.",
      close:"Close shares", my:"My shares", received:"Shared with me", loading:"Loading your snapshots…",
      retry:"Try again", emptyOwned:"You have not shared a snapshot yet.", emptyReceived:"No one has shared a snapshot with you yet.",
      signIn:"Sign in to view private snapshots.", signin_required:"Please sign in again to continue.",
      loadError:"Snapshots are temporarily unavailable. Your view has been cleared; try again.",
      share:"Share a snapshot privately", back:"Back to shares", make:"Prepare snapshot", upload:"Share with selected friends",
      working:"Working…", question:"Question", context:"Context", messages:"Discussion messages", synthesis:"Decision brief",
      full:"Complete snapshot", insights:"Selected perspectives", brief:"Decision brief only",
      fullHint:"Question, context, every discussion message and the decision brief.",
      insightsHint:"Question and only the persona messages you choose. No context or decision brief.",
      briefHint:"Question and synthesis only. No context or discussion messages.",
      choose:"Choose what to include", selectPeople:"Choose perspective messages", preview:"Review snapshot on this device",
      backEdit:"Back to choices", previewDisclosure:"This preview is built locally in your browser. Nothing has been uploaded yet.",
      disclosure:"Only the content you choose below is uploaded to server storage as a fixed snapshot and is visible to the accepted friends you select. Your other browser discussions stay local; later edits are not shared automatically.",
      immutable:"Revoking access cannot retract anything a recipient has already read or copied.",
      pickFriends:"Share with accepted friends", friendsLoading:"Loading accepted friends…",
      friendsError:"Accepted friends could not be loaded. Retry before sharing.", noFriends:"You have no accepted friends to share with yet.",
      selectAtLeast:"Choose at least one friend.", noSelectedMessages:"Choose at least one persona message for an insights snapshot.",
      confirmUpload:"Share this exact preview with the selected friends?", tooLong:"This snapshot exceeds a safe size or field limit. Nothing was uploaded.",
      created:"Snapshot shared.", open:"Open snapshot", owner:"You shared this", sharedBy:"Shared by",
      recipients:"recipients", receivedOn:"Received", entries:"messages", noContext:"No context included.",
      noBrief:"No decision brief included.", grant:"Give another friend access", add:"Give access",
      revoke:"Revoke", delete:"Delete snapshot", deleteConfirm:"Delete this snapshot? Friends will lose access, but anything already read or copied cannot be recalled.",
      revokeConfirm:"Revoke this friend's access? Anything already read or copied cannot be recalled.",
      grantConfirm:"Give this friend access to the immutable snapshot?",
      unavailable:"This snapshot is no longer available. Its contents have been cleared.",
      ownerOnly:"Only the owner can manage access to this snapshot.", notFriend:"That person is no longer an accepted friend.",
      friends_required:"Choose at least one accepted friend.", share_unavailable:"This snapshot is no longer available.",
      owner_only:"Only the owner can manage this snapshot.", not_friend:"That person is no longer an accepted friend.",
      invalid_request:"That request was not valid.", share_limit:"You have reached the snapshot sharing limit.",
      storage_unavailable:"Snapshots are temporarily unavailable. Please try again.",
      actionError:"That action could not be completed. Please try again.", copyError:"Some text could not be safely shared. Nothing was uploaded.",
      cancel:"Cancel", confirm:"Confirm", yesDelete:"Delete snapshot", yesRevoke:"Revoke access", deleted:"Snapshot deleted.",
      createdAt:"Shared", demo:"Scripted example", live:"Live AI response", demoBrief:"Scripted synthesis", you:"You", chair:"Council chair",
      privacy:"Private by design", previewTitle:"A local review before sharing", sharedContent:"Snapshot contents",
      selected:"selected", grants:"People with access", noGrants:"No friends currently have access.",
      refresh:"Updated just now", badge:"IMMUTABLE SNAPSHOT", readOnly:"Read-only copy",
      recipientNote:"This is a private, read-only snapshot. It does not add anything to your discussion history.",
      ownerNote:"Only you can change who has access or delete the server-side snapshot.",
      fullQuestion:"Question", contentIncluded:"Included", eachEntry:"Each message includes its participant label and whether it was scripted.",
      errors:{signin_required:"Please sign in again.",friends_required:"Choose at least one accepted friend.",share_unavailable:"This snapshot is no longer available.",owner_only:"Only the owner can do that.",not_friend:"That person is no longer an accepted friend.",invalid_request:"That request was not valid.",share_limit:"You have reached the sharing limit.",storage_unavailable:"Snapshots are temporarily unavailable."}
    },
    ar: {
      title:"اللقطات المشتركة", subtitle:"خلاصات تشاركها عن قصد مع أشخاص تثق بهم.",
      close:"إغلاق المشاركات", my:"لقطاتي", received:"مشاركات وصلتني", loading:"جارٍ تحميل لقطاتك…",
      retry:"حاول مجدداً", emptyOwned:"لم تشارك أي لقطة بعد.", emptyReceived:"لم يشارك أحد لقطة معك بعد.",
      signIn:"سجّل الدخول لعرض اللقطات الخاصة.", signin_required:"سجّل الدخول مجدداً للمتابعة.",
      loadError:"اللقطات غير متاحة مؤقتاً. أُخفي المحتوى؛ حاول مجدداً.",
      share:"شارك لقطة خاصة", back:"العودة إلى اللقطات", make:"إعداد اللقطة", upload:"شارك مع الأصدقاء المحددين",
      working:"جارٍ التنفيذ…", question:"السؤال", context:"السياق", messages:"رسائل النقاش", synthesis:"خلاصة القرار",
      full:"لقطة كاملة", insights:"منظورات محددة", brief:"خلاصة القرار فقط",
      fullHint:"السؤال والسياق وجميع رسائل النقاش وخلاصة القرار.",
      insightsHint:"السؤال ورسائل الشخصيات التي تختارها فقط. بلا سياق أو خلاصة قرار.",
      briefHint:"السؤال والخلاصة فقط. بلا سياق أو رسائل النقاش.",
      choose:"اختر ما تريد تضمينه", selectPeople:"اختر رسائل المنظورات", preview:"راجع اللقطة على هذا الجهاز",
      backEdit:"العودة للاختيارات", previewDisclosure:"أُعدّت هذه المعاينة محلياً في متصفحك. لم يُرفع شيء بعد.",
      disclosure:"يُرفع فقط المحتوى الذي تختاره أدناه إلى تخزين الخادم كلقطة ثابتة، ويظهر للأصدقاء المقبولين الذين تحددهم. تبقى نقاشات المتصفح الأخرى محلية، ولا تُشارك التعديلات اللاحقة تلقائياً.",
      immutable:"لا يمكن لسحب الوصول استرداد محتوى قرأه المستلم أو نسخه.",
      pickFriends:"شارك مع الأصدقاء المقبولين", friendsLoading:"جارٍ تحميل الأصدقاء المقبولين…",
      friendsError:"تعذّر تحميل الأصدقاء المقبولين. أعد المحاولة قبل المشاركة.", noFriends:"ليس لديك أصدقاء مقبولون للمشاركة معهم بعد.",
      selectAtLeast:"اختر صديقاً واحداً على الأقل.", noSelectedMessages:"اختر رسالة شخصية واحدة على الأقل للقطات المنظورات.",
      confirmUpload:"هل تريد مشاركة هذه المعاينة نفسها مع الأصدقاء المحددين؟", tooLong:"تتجاوز اللقطة حداً آمناً للحجم أو لأحد الحقول. لم يُرفع شيء.",
      created:"تمت مشاركة اللقطة.", open:"افتح اللقطة", owner:"لقطة شاركتها", sharedBy:"شاركها",
      recipients:"مستلمين", receivedOn:"وصلت", entries:"رسائل", noContext:"لا يتضمن هذا السياق.",
      noBrief:"لا تتضمن هذه اللقطة خلاصة قرار.", grant:"امنح صديقاً آخر حق الوصول", add:"منح الوصول",
      revoke:"سحب الوصول", delete:"حذف اللقطة", deleteConfirm:"هل تريد حذف هذه اللقطة؟ سيفقد الأصدقاء الوصول، لكن لا يمكن استرداد ما قرؤوه أو نسخوه.",
      revokeConfirm:"هل تريد سحب وصول هذا الصديق؟ لا يمكن استرداد ما قرأه أو نسخه.",
      grantConfirm:"هل تريد منح هذا الصديق حق الوصول إلى اللقطة الثابتة؟",
      unavailable:"لم تعد هذه اللقطة متاحة. أُزيل محتواها من العرض.",
      ownerOnly:"يمكن للمالك وحده إدارة الوصول إلى هذه اللقطة.", notFriend:"لم يعد هذا الشخص صديقاً مقبولاً.",
      friends_required:"اختر صديقاً مقبولاً واحداً على الأقل.", share_unavailable:"لم تعد هذه اللقطة متاحة.",
      owner_only:"يمكن للمالك وحده إدارة هذه اللقطة.", not_friend:"لم يعد هذا الشخص صديقاً مقبولاً.",
      invalid_request:"هذا الطلب غير صالح.", share_limit:"بلغت حد مشاركة اللقطات.",
      storage_unavailable:"اللقطات غير متاحة مؤقتاً. حاول مجدداً.",
      actionError:"تعذّر إتمام الإجراء. حاول مجدداً.", copyError:"تعذّر إعداد بعض النص بأمان. لم يُرفع شيء.",
      cancel:"إلغاء", confirm:"تأكيد", yesDelete:"حذف اللقطة", yesRevoke:"سحب الوصول", deleted:"تم حذف اللقطة.",
      createdAt:"تمت المشاركة", demo:"مثال مكتوب مسبقاً", live:"إجابة مباشرة بالذكاء الاصطناعي", demoBrief:"خلاصة مكتوبة مسبقاً", you:"أنت", chair:"رئيس المجلس",
      privacy:"خصوصية من الأساس", previewTitle:"مراجعة محلية قبل المشاركة", sharedContent:"محتوى اللقطة",
      selected:"محدد", grants:"الأشخاص الذين لديهم وصول", noGrants:"لا يملك أي صديق وصولاً حالياً.",
      refresh:"تم التحديث للتو", badge:"لقطة ثابتة", readOnly:"نسخة للقراءة فقط",
      recipientNote:"هذه لقطة خاصة للقراءة فقط. لا تُضاف إلى سجل نقاشاتك.",
      ownerNote:"يمكنك وحدك تغيير من لديه وصول أو حذف اللقطة من الخادم.",
      fullQuestion:"السؤال", contentIncluded:"المحتوى المتضمن", eachEntry:"تتضمن كل رسالة اسم المشارك وما إذا كانت مثالاً مكتوباً مسبقاً.",
      errors:{signin_required:"سجّل الدخول مجدداً.",friends_required:"اختر صديقاً مقبولاً واحداً على الأقل.",share_unavailable:"لم تعد هذه اللقطة متاحة.",owner_only:"يمكن للمالك وحده تنفيذ ذلك.",not_friend:"لم يعد هذا الشخص صديقاً مقبولاً.",invalid_request:"هذا الطلب غير صالح.",share_limit:"بلغت حد المشاركة.",storage_unavailable:"اللقطات غير متاحة مؤقتاً."}
    }
  };
  const rtl = () => (root.lang || document.body?.lang || "").toLowerCase().startsWith("ar");
  const t = key => {
    const dict = words[rtl() ? "ar" : "en"];
    return dict[key] || dict.errors?.[key] || words.en[key] || key;
  };
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[ch]);
  const signedIn = () => !!(AUTH()?.state?.signedIn);
  const idSafe = value => esc(value);
  const icon = name => {
    const paths = {
      close:'<path d="m6 6 12 12M18 6 6 18"/>', lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', person:'<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
      refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
      trash:'<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>', check:'<path d="m5 12 4 4L19 6"/>'
    };
    return `<svg class="cs-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
  };
  let active = false, dialog = null, lastFocus = null, view = "list", listData = null, shareDetail = null;
  let selectedId = "", error = "", notice = "", busy = false, loading = false;
  let previousBodyOverflow = "";
  let refreshTimer = 0, generation = 0, requestVersion = 0, friends = [], friendsLoading = false, friendsFailed = false, friendsReady = false;
  let draft = null, selectedFriends = new Set(), selectedEntries = new Set(), confirmAction = null;

  function styles() {
    if (document.getElementById("council-shares-styles")) return;
    const style = document.createElement("style");
    style.id = "council-shares-styles";
    style.textContent = `
      .cs-overlay{position:fixed;inset:0;z-index:1120;display:grid;place-items:center;padding:20px;background:rgba(12,17,14,.58);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);animation:csFade .18s ease both}
      .cs-dialog{--cs-bg:var(--bg,#F1F2ED);--cs-surface:var(--surface,#fff);--cs-surface2:var(--surface-2,#F7F8F4);--cs-ink:var(--ink,#131715);--cs-ink2:var(--ink-2,#39403C);--cs-muted:var(--muted,#5F6862);--cs-faint:var(--faint,#858D88);--cs-line:var(--line,#DFE2DA);--cs-strong:var(--line-strong,#C6CBC2);--cs-green:var(--green,#0E7C5A);--cs-soft:var(--green-soft,#E1F0E9);--cs-brand:var(--brand,#C9522D);--cs-danger:var(--err-ink,#9C2A16);font:14px/1.55 var(--sans,"Schibsted Grotesk",system-ui,sans-serif);color:var(--cs-ink2);background:var(--cs-bg);border:1px solid var(--cs-line);border-radius:22px;box-shadow:var(--shadow-lg,0 24px 70px rgba(10,20,15,.22));width:min(900px,100%);max-height:min(94dvh,960px);display:flex;flex-direction:column;overflow:hidden;animation:csRise .22s cubic-bezier(.2,.7,.2,1) both}
      .cs-dialog[dir=rtl]{font-family:var(--ar-sans,"IBM Plex Sans Arabic",Tahoma,sans-serif);font-size:15px}.cs-dialog *{box-sizing:border-box}.cs-dialog button,.cs-dialog select{font:inherit;color:inherit}.cs-dialog button{cursor:pointer}.cs-dialog button:focus-visible,.cs-dialog select:focus-visible{outline:2px solid var(--cs-green);outline-offset:3px}
      .cs-icon{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .cs-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .cs-head{display:flex;align-items:flex-start;gap:16px;padding:22px 27px 18px;border-bottom:1px solid var(--cs-line);background:var(--cs-surface)}.cs-head-copy{min-width:0;flex:1}.cs-kicker{margin:0 0 5px;color:var(--cs-brand);font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}.cs-dialog[dir=rtl] .cs-kicker{letter-spacing:0;font-size:13px}.cs-head h1{font:400 clamp(25px,3vw,34px)/1.15 var(--serif,"Newsreader",Georgia,serif);letter-spacing:-.02em;color:var(--cs-ink);margin:0}.cs-dialog[dir=rtl] .cs-head h1{font-family:var(--ar-serif,"Noto Naskh Arabic",serif);font-weight:600;letter-spacing:0;line-height:1.4}.cs-subtitle{margin:5px 0 0;color:var(--cs-muted);font-size:13px}
      .cs-close{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--cs-line);border-radius:50%;background:var(--cs-surface2);color:var(--cs-muted);flex:none;transition:background .15s,transform .15s}.cs-close:hover{background:var(--cs-line);transform:rotate(4deg)}
      .cs-body{overflow:auto;padding:22px 27px 28px;overscroll-behavior:contain;min-height:180px}.cs-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:15px}.cs-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;border:1px solid var(--cs-strong);border-radius:999px;background:var(--cs-surface);color:var(--cs-ink);padding:7px 13px;font-size:12px;font-weight:650;line-height:1.2;transition:background .15s,border-color .15s,transform .12s}.cs-btn:hover{border-color:var(--cs-ink2);background:var(--cs-surface2)}.cs-btn:active{transform:translateY(1px)}.cs-btn.primary{background:var(--cs-green);border-color:var(--cs-green);color:var(--green-ink,#fff)}.cs-btn.primary:hover{filter:brightness(.94)}.cs-btn.quiet{background:transparent;border-color:transparent;color:var(--cs-muted)}.cs-btn.danger{color:var(--cs-danger)}.cs-btn.danger:hover{background:var(--err-soft,#FCE8E4)}.cs-btn:disabled{opacity:.5;cursor:not-allowed}
      .cs-status{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;margin:0 0 14px;border-radius:11px;font-size:13px}.cs-status p{margin:0;flex:1}.cs-status.error{color:var(--cs-danger);background:var(--err-soft,#FCE8E4);border:1px solid color-mix(in srgb,var(--cs-danger) 20%,transparent)}.cs-status.success{color:var(--cs-green);background:var(--cs-soft);border:1px solid color-mix(in srgb,var(--cs-green) 20%,transparent)}
      .cs-intro{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid var(--cs-line);border-radius:13px;background:var(--cs-surface2);color:var(--cs-muted);font-size:13px;margin-bottom:17px}.cs-intro .cs-icon{color:var(--cs-green);margin-top:2px}.cs-intro p{margin:0}
      .cs-tabs{display:flex;gap:6px;padding:4px;background:var(--cs-surface2);border:1px solid var(--cs-line);border-radius:999px;width:max-content;margin:0 0 17px}.cs-tabs button{border:0;border-radius:99px;background:transparent;padding:8px 14px;color:var(--cs-muted);font-size:12px;font-weight:650}.cs-tabs button[aria-selected=true]{background:var(--cs-surface);color:var(--cs-ink);box-shadow:var(--shadow-sm,0 1px 3px rgba(20,30,25,.08))}
      .cs-list{display:grid;gap:10px}.cs-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:13px;align-items:center;padding:16px 17px;background:var(--cs-surface);border:1px solid var(--cs-line);border-radius:15px;box-shadow:var(--shadow-sm,0 1px 2px rgba(20,30,25,.05));transition:transform .16s,border-color .16s}.cs-card:hover{transform:translateY(-1px);border-color:var(--cs-strong)}.cs-card h2{margin:0;color:var(--cs-ink);font:500 19px/1.3 var(--serif,"Newsreader",Georgia,serif);overflow-wrap:anywhere}.cs-card-main{min-width:0}.cs-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;color:var(--cs-muted);font-size:12px}.cs-kind{display:inline-flex;align-items:center;border-radius:99px;padding:3px 8px;font-size:10px;letter-spacing:.04em;text-transform:uppercase;font-weight:700;background:var(--cs-soft);color:var(--cs-green)}
      .cs-empty{display:grid;justify-items:center;text-align:center;padding:42px 20px 48px;border:1px dashed var(--cs-strong);border-radius:16px;background:color-mix(in srgb,var(--cs-surface2) 70%,transparent)}.cs-empty-mark{width:50px;height:50px;border-radius:17px;display:grid;place-items:center;background:var(--cs-soft);color:var(--cs-green);margin-bottom:14px}.cs-empty h2{font:500 21px var(--serif,"Newsreader",Georgia,serif);color:var(--cs-ink);margin:0 0 6px}.cs-empty p{margin:0;color:var(--cs-muted);max-width:43ch;font-size:13px}
      .cs-skeletons{display:grid;gap:11px}.cs-skeleton{height:83px;border-radius:15px;background:linear-gradient(100deg,var(--cs-surface2) 20%,var(--cs-line) 42%,var(--cs-surface2) 64%);background-size:250% 100%;animation:csShimmer 1.5s linear infinite}
      .cs-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 17px}.cs-option{display:flex;align-items:flex-start;gap:10px;text-align:start;padding:14px;background:var(--cs-surface);border:1px solid var(--cs-line);border-radius:14px;min-height:104px}.cs-option:has(input:checked){border-color:var(--cs-green);box-shadow:inset 0 0 0 1px var(--cs-green);background:color-mix(in srgb,var(--cs-soft) 32%,var(--cs-surface))}.cs-option input,.cs-check input{accent-color:var(--cs-green);margin:3px 0 0;flex:none}.cs-option b{display:block;color:var(--cs-ink);margin-bottom:4px}.cs-option small{display:block;color:var(--cs-muted);font-size:11px;line-height:1.45}.cs-panel-title{font:500 18px var(--serif,"Newsreader",Georgia,serif);color:var(--cs-ink);margin:0 0 9px}.cs-muted{color:var(--cs-muted);font-size:12px}
      .cs-panel{background:var(--cs-surface);border:1px solid var(--cs-line);border-radius:15px;padding:16px 18px;margin-bottom:13px;min-width:0}.cs-panel h2{font:500 18px/1.3 var(--serif,"Newsreader",Georgia,serif);color:var(--cs-ink);margin:0 0 10px}.cs-field{border-top:1px solid var(--cs-line);padding:13px 0}.cs-field:first-of-type{border-top:0;padding-top:2px}.cs-field-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--cs-green);font-weight:700}.cs-field p{margin:6px 0 0;color:var(--cs-ink2);white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.65}.cs-entry{padding:12px 0;border-top:1px solid var(--cs-line)}.cs-entry:first-of-type{border-top:0}.cs-entry-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px}.cs-entry-head b{color:var(--cs-ink);font-size:12px}.cs-entry p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.65}.cs-demo{border-radius:99px;background:color-mix(in srgb,var(--cs-brand) 12%,var(--cs-surface));color:var(--cs-brand);padding:2px 7px;font-size:10px;font-weight:700}.cs-brief{border-top:2px solid var(--cs-brand);background:color-mix(in srgb,var(--cs-brand) 6%,var(--cs-surface))}
      .cs-checklist{display:grid;gap:0}.cs-check{display:flex;align-items:flex-start;gap:10px;padding:10px 2px;border-top:1px solid var(--cs-line);color:var(--cs-ink);font-size:13px}.cs-check:first-child{border-top:0}.cs-check span{min-width:0;flex:1}.cs-check small{display:block;color:var(--cs-muted);margin-top:3px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:4.2em;overflow:hidden}.cs-count{color:var(--cs-muted);font-size:11px;margin-inline-start:auto}
      .cs-ownerbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cs-select{min-height:38px;min-width:min(320px,100%);border:1px solid var(--cs-strong);background:var(--cs-bg);border-radius:10px;padding:7px 10px}.cs-grant{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--cs-line)}.cs-grant:first-of-type{border-top:0}.cs-grant b{flex:1;color:var(--cs-ink);overflow-wrap:anywhere}
      .cs-detail-head{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px}.cs-detail-head .cs-kind{margin-top:4px}.cs-detail-title{font:500 clamp(23px,3vw,32px)/1.25 var(--serif,"Newsreader",Georgia,serif);color:var(--cs-ink);margin:6px 0 0;overflow-wrap:anywhere;flex:1;min-width:210px}.cs-foot{display:flex;align-items:flex-start;gap:7px;color:var(--cs-faint);font-size:11.5px;margin-top:14px}.cs-dialog[aria-busy=true] .cs-btn{cursor:wait}
      .cs-confirm-layer{position:absolute;inset:0;z-index:3;display:grid;place-items:center;padding:20px;background:rgba(8,13,10,.48)}.cs-confirm{width:min(430px,100%);background:var(--cs-surface);border:1px solid var(--cs-line);border-radius:18px;padding:22px;box-shadow:var(--shadow-lg,0 20px 60px rgba(0,0,0,.2))}.cs-confirm h2{font:500 20px var(--serif,"Newsreader",Georgia,serif);margin:0 0 8px;color:var(--cs-ink)}.cs-confirm p{color:var(--cs-muted);margin:0 0 18px}.cs-confirm-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      @keyframes csFade{from{opacity:0}to{opacity:1}}@keyframes csRise{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}@keyframes csShimmer{to{background-position:-250% 0}}
      @media(max-width:700px){.cs-overlay{padding:0;place-items:end center}.cs-dialog{width:100%;max-height:96dvh;border-radius:20px 20px 0 0;border-bottom:0}.cs-head{padding:18px 17px 14px}.cs-body{padding:16px 16px max(22px,env(safe-area-inset-bottom))}.cs-options{grid-template-columns:1fr}.cs-option{min-height:0}.cs-card{grid-template-columns:1fr}.cs-card .cs-btn{justify-self:start}.cs-panel{padding:14px}.cs-toolbar .cs-btn{min-height:34px}}
      @media(prefers-reduced-motion:reduce){.cs-overlay,.cs-dialog,.cs-skeleton{animation:none!important}.cs-btn,.cs-close,.cs-card{transition:none!important}}
    `;
    // Toolbar buttons have a more-specific compact rule above; override it
    // explicitly so every mobile action retains a 44px touch target.
    style.textContent += "\n@media(max-width:640px){.cs-dialog .cs-btn,.cs-dialog .cs-toolbar .cs-btn,.cs-dialog .cs-confirm-actions .cs-btn{min-height:44px;min-width:44px}.cs-close{width:44px;height:44px}}";
    document.head.appendChild(style);
  }
  async function request(body, query = "") {
    const response = await fetch(`${API}${query}`, {
      method: body ? "POST" : "GET", credentials:"same-origin", cache:"no-store",
      ...(body ? {headers:{"Content-Type":"application/json"},body:JSON.stringify(body)} : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || "Share request failed"), {code:data.code || "",status:response.status});
    return data;
  }
  function safeDate(ts) {
    try { return new Date(ts).toLocaleDateString(rtl() ? "ar" : "en", {year:"numeric",month:"short",day:"numeric"}); } catch { return ""; }
  }
  function statusHTML() {
    if (error) return `<div class="cs-status error" role="alert">${icon("close")}<p>${esc(error)}</p>${error === t("loadError") || error === t("friendsError") ? `<button class="cs-btn" data-cs-action="${error === t("friendsError") ? "retry-friends" : "retry"}">${esc(t("retry"))}</button>` : ""}</div>`;
    return notice ? `<div class="cs-status success" role="status" aria-live="polite">${icon("check")}<p>${esc(notice)}</p></div>` : "";
  }
  function localSnapshot(raw, kind) {
    const question = String(raw?.question || "");
    const messages = Array.isArray(raw?.messages) ? raw.messages : [];
    let entries = [], personaIndex = 0;
    if (kind === "full" || kind === "insights") {
      entries = messages.flatMap(m => {
        if (!m || typeof m.text !== "string" || !m.text.trim()) return [];
        let author = t("chair");
        if (m.type === "persona") author = m.personaName || window.COUNCIL_DISCUSSION?.personaName?.(m.pid, raw) || t("chair");
        else if (m.authorName) author = m.authorName;
        else if (m.type === "host") author = AUTH()?.state?.name || t("you");
        else if (m.type === "mod") author = rtl() ? "المُيسّر" : "Moderator";
        else if (m.type === "event") author = rtl() ? "حدث في النقاش" : "Discussion note";
        const persona = m.type === "persona";
        const entry = {author:String(author),text:String(m.text),demo:!!(m.demo || raw.example),persona,personaIndex:persona ? personaIndex++ : -1};
        return [entry];
      });
    }
    if (kind === "insights") entries = entries.filter(entry => entry.persona && selectedEntries.has(String(entry.personaIndex)));
    const snapshot = {kind,question,demo:!!raw.example};
    if (kind === "full" || kind === "insights") snapshot.entries = entries.map(({author,text,demo}) => ({author,text,demo}));
    if (kind === "full") {
      snapshot.context = String(raw.context || "");
      snapshot.brief = String(raw.synthesis || "");
    } else if (kind === "brief") snapshot.brief = String(raw.synthesis || "");
    snapshot.demo = !!(raw.example || ((kind === "full" || kind === "brief") && raw.synthDemo) || entries.some(entry => entry.demo));
    return snapshot;
  }
  function validateSnapshot(snap) {
    if (!snap || !["full","insights","brief"].includes(snap.kind) || typeof snap.question !== "string" || snap.question.length > 2000 ||
        (snap.kind === "full" && snap.context.length > 10000) ||
        (snap.kind !== "insights" && (typeof snap.brief !== "string" || snap.brief.length > 24000)) ||
        (snap.kind === "brief" && !snap.brief.trim()) ||
        ((snap.kind === "full" || snap.kind === "insights") && (!Array.isArray(snap.entries) || snap.entries.length > 600 || snap.entries.some(e => typeof e.author !== "string" || typeof e.text !== "string" || e.author.length > 160 || e.text.length > 16000)))) return false;
    try {
      const payload = JSON.stringify({action:"create",snapshot:snap,friendIds:[...selectedFriends]});
      return new TextEncoder().encode(payload).length <= 380000;
    } catch { return false; }
  }
  function intro(text) { return `<div class="cs-intro">${icon("lock")}<p>${esc(text)}</p></div>`; }
  function sourceDisclosure() {
    const ar = rtl();
    return intro(draft?.roomId
      ? (ar ? "نسخة من المجلس المشترك. قد تتضمن مساهمات الأصدقاء وملاحظاتهم. راجع المحتوى والمستلمين قبل مشاركة نسخة ثابتة خارج الغرفة. لن تتضمن الرسائل اللاحقة تلقائياً."
        : "Copy of the shared council. This may include friends' contributions and feedback. Review the content and recipients before sharing a fixed copy outside the room. Later messages are not included automatically.")
      : (ar ? "نسخة من نقاشك الشخصي، وليست من المجلس المشترك. لا تتضمن المساهمات التي أضافها الأصدقاء داخل الغرفة."
        : "Copy of your personal discussion, not the shared council. Contributions added by friends inside the room are not included."));
  }
  function shareRows(rows, owned) {
    if (!rows.length) return `<div class="cs-empty"><span class="cs-empty-mark">${icon("lock")}</span><h2>${esc(t(owned ? "emptyOwned" : "emptyReceived"))}</h2><p>${esc(owned ? t("disclosure") : t("recipientNote"))}</p>${owned ? `<button class="cs-btn primary" data-cs-action="new">${esc(t("share"))}</button>` : ""}</div>`;
    return `<div class="cs-list">${rows.map(item => `<article class="cs-card"><div class="cs-card-main"><span class="cs-kind">${esc(t(item.kind || "full"))}</span><h2 dir="auto">${esc(item.question || "—")}</h2><div class="cs-meta"><span>${esc(owned ? t("owner") : `${t("sharedBy")} ${item.ownerName || ""}`)}</span><span aria-hidden="true">·</span><span>${esc(safeDate(item.createdAt))}</span>${owned ? `<span aria-hidden="true">·</span><span>${Number(item.recipients) || 0} ${esc(t("recipients"))}</span>` : ""}</div></div><button class="cs-btn" data-cs-action="open" data-id="${idSafe(item.id)}">${icon("arrow")}${esc(t("open"))}</button></article>`).join("")}</div>`;
  }
  function listHTML() {
    if (!signedIn()) return `<div class="cs-empty"><span class="cs-empty-mark">${icon("lock")}</span><h2>${esc(t("signIn"))}</h2><button class="cs-btn primary" data-cs-action="sign-in">${esc((root.lang || "").startsWith("ar") ? "تسجيل الدخول" : "Sign in")}</button></div>`;
    if (loading && !listData) return `<div class="cs-skeletons" aria-busy="true"><div class="cs-skeleton"></div><div class="cs-skeleton"></div><div class="cs-skeleton"></div></div>`;
    const owned = Array.isArray(listData?.owned) ? listData.owned : [];
    const received = Array.isArray(listData?.received) ? listData.received : [];
    return `${intro(t("disclosure"))}<div class="cs-tabs" role="tablist"><button role="tab" data-cs-action="tab" data-tab="owned" aria-selected="${tab === "owned"}">${esc(t("my"))} <span>${owned.length}</span></button><button role="tab" data-cs-action="tab" data-tab="received" aria-selected="${tab === "received"}">${esc(t("received"))} <span>${received.length}</span></button></div>${shareRows(tab === "owned" ? owned : received, tab === "owned")}`;
  }
  function chooseHTML() {
    const s = draft;
    const entryOptions = s.kind === "insights" ? (s.allEntries || []).map((entry, i) => entry.persona ? `<label class="cs-check"><input type="checkbox" data-cs-entry="${i}" ${selectedEntries.has(String(i)) ? "checked" : ""} ${busy ? "disabled" : ""}><span><b>${esc(entry.author)}</b><small>${esc(entry.text)}</small></span>${entry.demo ? `<i class="cs-demo">${esc(t("demo"))}</i>` : ""}</label>` : "").join("") : "";
    const friendContent = friendsLoading ? `<p>${esc(t("friendsLoading"))}</p>` : friendsFailed ? `<p>${esc(t("friendsError"))}</p><button class="cs-btn" data-cs-action="retry-friends">${esc(t("retry"))}</button>` : !friends.length ? `<p>${esc(t("noFriends"))}</p><button class="cs-btn primary" data-cs-action="add-friend">${esc((root.lang || "").startsWith("ar") ? "أضف صديقاً أولاً" : "Add a friend first")}</button>` : `<div class="cs-checklist">${friends.map(f => `<label class="cs-check"><input type="checkbox" data-cs-friend="${idSafe(f.id)}" ${selectedFriends.has(String(f.id)) ? "checked" : ""} ${busy ? "disabled" : ""}><span><b>${esc(f.name || "")}</b></span></label>`).join("")}</div>`;
    return `${statusHTML()}<div class="cs-toolbar"><button class="cs-btn quiet" data-cs-action="back">${icon("arrow")}${esc(t("back"))}</button></div>
      ${sourceDisclosure()}${intro(t("disclosure"))}<section aria-labelledby="cs-kind-title"><h2 id="cs-kind-title" class="cs-panel-title">${esc(t("choose"))}</h2>
      <div class="cs-options">${[["full","fullHint"],["insights","insightsHint"],["brief","briefHint"]].map(([kind,hint]) => `<label class="cs-option"><input type="radio" name="cs-kind" value="${kind}" data-cs-kind ${s.kind === kind ? "checked" : ""} ${busy ? "disabled" : ""}><span><b>${esc(t(kind))}</b><small>${esc(t(hint))}</small></span></label>`).join("")}</div></section>
      ${s.kind === "insights" ? `<section class="cs-panel"><h2>${esc(t("selectPeople"))}</h2><p class="cs-muted">${esc(t("eachEntry"))}</p><div class="cs-checklist">${entryOptions || `<p>${esc(t("noSelectedMessages"))}</p>`}</div></section>` : ""}
      <section class="cs-panel"><h2>${esc(t("pickFriends"))}</h2>${friendContent}</section>
      ${error ? "" : ""}<div class="cs-toolbar"><button class="cs-btn primary" data-cs-action="preview" ${busy || friendsLoading || friendsFailed || !friends.length ? "disabled" : ""}>${esc(t("preview"))}${icon("arrow")}</button></div>`;
  }
  function previewField(label, value, extra = "") {
    return value ? `<div class="cs-field ${extra}"><span class="cs-field-label">${esc(label)}</span><p dir="auto">${esc(value)}</p></div>` : "";
  }
  function snapshotHTML(snapshot, briefDemo = false) {
    const entries = snapshot.entries || [];
    return `<section class="cs-panel"><h2>${esc(t("sharedContent"))} · ${esc(t(snapshot.kind))}</h2>
      ${previewField(t("question"),snapshot.question)}
      ${snapshot.kind === "full" ? previewField(t("context"),snapshot.context || t("noContext")) : ""}
      ${snapshot.kind === "full" || snapshot.kind === "insights" ? `<div class="cs-field"><span class="cs-field-label">${esc(t("messages"))} · ${entries.length}</span>${entries.length ? entries.map(entry => `<article class="cs-entry"><div class="cs-entry-head"><b>${esc(entry.author)}</b>${entry.demo ? `<span class="cs-demo">${esc(t("demo"))}</span>` : ""}</div><p dir="auto">${esc(entry.text)}</p></article>`).join("") : `<p>—</p>`}</div>` : ""}
      ${snapshot.kind !== "insights" ? `<div class="cs-field cs-brief"><span class="cs-field-label">${esc(t("synthesis"))}${briefDemo ? ` · <span class="cs-demo">${esc(t("demoBrief"))}</span>` : ""}</span><p dir="auto">${esc(snapshot.brief || t("noBrief"))}</p></div>` : ""}
      <div class="cs-field"><span class="cs-field-label">${esc(t("contentIncluded"))}</span><p>${esc(snapshot.kind === "full" ? `${t("question")} · ${t("context")} · ${t("messages")} · ${t("synthesis")}` : snapshot.kind === "brief" ? `${t("question")} · ${t("synthesis")}` : `${t("question")} · ${t("messages")}`)}</p></div>
      </section>`;
  }
  function previewHTML() {
    const snap = draft.preview;
    return `${statusHTML()}<div class="cs-toolbar"><button class="cs-btn quiet" data-cs-action="edit">${icon("arrow")}${esc(t("backEdit"))}</button></div>
      ${sourceDisclosure()}<div class="cs-intro">${icon("lock")}<div><p><b>${esc(t("previewTitle"))}.</b> ${esc(t("previewDisclosure"))}</p><p style="margin-top:7px">${esc(t("immutable"))}</p></div></div>
      ${snapshotHTML(snap, !!(draft.raw.synthDemo || draft.raw.example))}<section class="cs-panel"><h2>${esc(t("pickFriends"))}</h2><p>${esc(friends.filter(f => selectedFriends.has(String(f.id))).map(f => f.name).join(", ")) || "—"}</p></section>
      <div class="cs-toolbar"><button class="cs-btn primary" data-cs-action="upload" ${busy ? "disabled" : ""}>${busy ? esc(t("working")) : esc(t("upload"))}${icon("arrow")}</button></div>`;
  }
  function detailHTML() {
    const detail = shareDetail;
    if (loading && !detail) return `<div class="cs-skeletons" aria-busy="true"><div class="cs-skeleton"></div><div class="cs-skeleton" style="height:230px"></div><div class="cs-skeleton"></div></div>`;
    if (!detail?.share) return `<div class="cs-empty"><span class="cs-empty-mark">${icon("lock")}</span><h2>${esc(error || t("unavailable"))}</h2><button class="cs-btn" data-cs-action="back">${esc(t("back"))}</button></div>`;
    const s = detail.share, snap = s.snapshot || {};
    const grants = Array.isArray(detail.grants) ? detail.grants : [];
    const friendChoices = friends.filter(f => !grants.some(g => String(g.id) === String(f.id)));
    const manager = detail.owner ? `<section class="cs-panel"><h2>${esc(t("grants"))} · ${grants.length}</h2>${grants.length ? grants.map(g => `<div class="cs-grant"><b>${esc(g.name || "")}</b><button class="cs-btn danger" data-cs-action="revoke" data-id="${idSafe(g.id)}" ${busy ? "disabled" : ""}>${esc(t("revoke"))}</button></div>`).join("") : `<p>${esc(t("noGrants"))}</p>`}
       ${friendsLoading ? `<p>${esc(t("friendsLoading"))}</p>` : friendsFailed ? `<p>${esc(t("friendsError"))}</p><button class="cs-btn" data-cs-action="retry-friends">${esc(t("retry"))}</button>` : friendChoices.length ? `<div class="cs-ownerbar" style="margin-top:13px"><label class="cs-sr" for="cs-grant-select">${esc(t("grant"))}</label><select id="cs-grant-select" class="cs-select" ${busy ? "disabled" : ""}><option value="">${esc(t("grant"))}</option>${friendChoices.map(f => `<option value="${idSafe(f.id)}">${esc(f.name || "")}</option>`).join("")}</select><button class="cs-btn primary" data-cs-action="grant" ${busy ? "disabled" : ""}>${esc(t("add"))}</button></div>` : ""}</section>
       <section class="cs-panel"><p>${esc(t("ownerNote"))}</p><button class="cs-btn danger" data-cs-action="delete" ${busy ? "disabled" : ""}>${icon("trash")}${esc(t("delete"))}</button></section>` : `<div class="cs-intro">${icon("lock")}<p>${esc(t("recipientNote"))}</p></div>`;
    return `${statusHTML()}<div class="cs-toolbar"><button class="cs-btn quiet" data-cs-action="back">${icon("arrow")}${esc(t("back"))}</button><span class="cs-kind">${esc(t("badge"))}</span></div>
      <div class="cs-detail-head"><span class="cs-kind">${esc(t(snap.kind || "full"))}</span><h2 class="cs-detail-title" dir="auto">${esc(snap.question || "—")}</h2></div>
      <div class="cs-meta"><span>${esc(detail.owner ? t("owner") : `${t("sharedBy")} ${s.ownerName || ""}`)}</span><span aria-hidden="true">·</span><span>${esc(safeDate(s.createdAt))}</span><span aria-hidden="true">·</span><span>${esc(t("readOnly"))}</span></div>
      ${!detail.owner ? intro(t("recipientNote")) : intro(t("ownerNote"))}${snapshotHTML(snap, snap.kind === "brief" && snap.demo)}${manager}
      <div class="cs-foot">${icon("lock")}<span>${esc(t("immutable"))}</span></div>`;
  }
  function confirmHTML() {
    if (!confirmAction) return "";
    const isDelete = confirmAction.type === "delete";
    const message = isDelete ? t("deleteConfirm") : confirmAction.type === "revoke" ? t("revokeConfirm") : t("grantConfirm");
    return `<div class="cs-confirm-layer" data-cs-confirm-layer><section class="cs-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cs-confirm-title" aria-describedby="cs-confirm-copy" tabindex="-1"><h2 id="cs-confirm-title">${esc(t("confirm"))}</h2><p id="cs-confirm-copy">${esc(message)}</p><div class="cs-confirm-actions"><button class="cs-btn" data-cs-action="dismiss-confirm">${esc(t("cancel"))}</button><button class="cs-btn ${isDelete || confirmAction.type === "revoke" ? "danger" : "primary"}" data-cs-action="confirm" ${busy ? "disabled" : ""}>${busy ? esc(t("working")) : esc(isDelete ? t("yesDelete") : confirmAction.type === "revoke" ? t("yesRevoke") : t("add"))}</button></div></section></div>`;
  }
  function render() {
    if (!dialog) return;
    const focusEl = document.activeElement;
    const focusAction = focusEl?.getAttribute?.("data-cs-action") || "";
    const focusId = focusEl?.id || "";
    const focusKind = focusEl?.matches?.("[data-cs-kind]") ? focusEl.value : "";
    const focusFriend = focusEl?.getAttribute?.("data-cs-friend") || "";
    const focusEntry = focusEl?.getAttribute?.("data-cs-entry") || "";
    const scroll = dialog.querySelector(".cs-body")?.scrollTop || 0;
    let body = "";
    if (view === "list") body = `${statusHTML()}${listHTML()}`;
    else if (view === "room-loading") body = `${statusHTML()}<div class="cs-skeletons" aria-busy="true"><div class="cs-skeleton"></div></div>`;
    else if (view === "choose") body = chooseHTML();
    else if (view === "preview") body = previewHTML();
    else if (view === "detail") body = detailHTML();
    const title = view === "detail" ? (shareDetail?.share?.snapshot?.question || t("title")) : view === "choose" || view === "preview" ? t("share") : t("title");
    dialog.innerHTML = `<div class="cs-head"><div class="cs-head-copy"><p class="cs-kicker">The Council · ${esc(t("title"))}</p><h1 id="cs-title">${esc(title)}</h1><p class="cs-subtitle">${esc(t("subtitle"))}</p></div><button class="cs-close" type="button" data-cs-action="close" aria-label="${esc(t("close"))}">${icon("close")}</button></div><div class="cs-body">${body}</div>${confirmHTML()}`;
    dialog.setAttribute("dir",rtl() ? "rtl" : "ltr");
    dialog.setAttribute("aria-busy",busy || loading ? "true" : "false");
    const bodyEl = dialog.querySelector(".cs-body"); if (bodyEl) bodyEl.scrollTop = scroll;
    let target = focusId ? dialog.querySelector(`#${CSS.escape(focusId)}`) : null;
    if (!target && focusAction) target = dialog.querySelector(`[data-cs-action="${CSS.escape(focusAction)}"]`);
    if (!target && focusKind) target = dialog.querySelector(`[data-cs-kind][value="${CSS.escape(focusKind)}"]`);
    if (!target && focusFriend) target = dialog.querySelector(`[data-cs-friend="${CSS.escape(focusFriend)}"]`);
    if (!target && focusEntry) target = dialog.querySelector(`[data-cs-entry="${CSS.escape(focusEntry)}"]`);
    if (target) target.focus({preventScroll:true});
    if (confirmAction) dialog.querySelector(".cs-confirm [data-cs-action]")?.focus({preventScroll:true});
  }
  function startPolling() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (!active || !signedIn()) { if (active) signOutView(); return; }
      if (busy || loading || confirmAction) return;
      if (view === "detail" && selectedId) loadDetail(selectedId, true);
      else if (view === "list") loadList(true);
    }, 4000);
  }
  async function loadList(silent = false) {
    if (!active || !signedIn()) { signOutView(); return; }
    const version = ++requestVersion, own = generation;
    loading = true;
    if (!silent) { error = ""; render(); }
    try {
      if (!friendsReady) await loadFriends();
      const data = await request();
      if (!active || own !== generation || version !== requestVersion || !signedIn()) return;
      listData = {owned:Array.isArray(data.owned) ? data.owned : [],received:Array.isArray(data.received) ? data.received : []};
      loading = false; error = "";
    } catch (err) {
      if (!active || own !== generation || version !== requestVersion) return;
      loading = false; listData = null; shareDetail = null; selectedId = "";
      error = err.code === "signin_required" ? t("signin_required") : t("loadError");
    }
    render();
  }
  async function loadDetail(id, silent = false) {
    if (!active || !signedIn()) { signOutView(); return; }
    const version = ++requestVersion, own = generation;
    loading = true;
    if (!silent) { error = ""; shareDetail = null; render(); }
    try {
      const data = await request(null, `?id=${encodeURIComponent(id)}`);
      if (!active || own !== generation || version !== requestVersion || !signedIn() || selectedId !== id) return;
      if (!data?.share) throw Object.assign(new Error(), {code:"share_unavailable"});
      shareDetail = data; loading = false; error = "";
      if (data.owner && !friendsReady && !friendsLoading) loadFriends();
    } catch (err) {
      if (!active || own !== generation || version !== requestVersion) return;
      loading = false; shareDetail = null;
      error = err.code === "signin_required" ? t("signin_required") : err.code === "owner_only" ? t("ownerOnly") : t("unavailable");
    }
    render();
  }
  async function loadFriends() {
    if (friendsReady && !friendsFailed) return;
    if (!FRIENDS()?.load) { friends = []; friendsFailed = true; friendsLoading = false; render(); return; }
    const own = generation;
    friendsLoading = true; friendsFailed = false; render();
    try {
      const result = await FRIENDS().load();
      if (!active || own !== generation || !signedIn()) return;
      friends = Array.isArray(result?.friends) ? result.friends.filter(f => f && f.id != null) : [];
      friendsLoading = false; friendsFailed = false; friendsReady = true;
    } catch {
      if (!active || own !== generation) return;
      friends = []; friendsLoading = false; friendsFailed = true;
    }
    render();
  }
  function close() {
    if (!active) return;
    active = false; generation++; requestVersion++; clearInterval(refreshTimer); refreshTimer = 0;
    dialog?.closest("[data-cs-overlay]")?.remove(); dialog = null; listData = null; shareDetail = null; selectedId = "";
    document.body.style.overflow = previousBodyOverflow;
    busy = false; loading = false; friendsLoading = false; friendsFailed = false;
    error = ""; notice = ""; confirmAction = null; draft = null; selectedFriends.clear(); selectedEntries.clear(); friendsReady = false; friends = [];
    const focus = lastFocus; lastFocus = null;
    if (focus?.isConnected) focus.focus({preventScroll:true});
  }
  function signOutView() {
    generation++; requestVersion++; clearInterval(refreshTimer);
    listData = null; shareDetail = null; selectedId = ""; friends = []; friendsReady = false; draft = null;
    selectedFriends.clear(); selectedEntries.clear(); loading = false; busy = false; friendsLoading = false; friendsFailed = false; confirmAction = null;
    error = t("signin_required"); view = "list";
    if (dialog) render();
  }
  function openList() {
    if (!active) {
      styles(); active = true; generation++; lastFocus = document.activeElement;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog = document.createElement("section"); dialog.className = "cs-dialog";
      dialog.setAttribute("role","dialog"); dialog.setAttribute("aria-modal","true"); dialog.setAttribute("aria-labelledby","cs-title"); dialog.tabIndex = -1;
      const overlay = document.createElement("div"); overlay.className = "cs-overlay"; overlay.dataset.csOverlay = "true"; overlay.append(dialog); document.body.append(overlay);
      view = "list"; tab = "owned"; listData = null; shareDetail = null; error = ""; notice = ""; loading = false;
      render(); dialog.querySelector(".cs-close")?.focus({preventScroll:true});
    }
    if (!signedIn()) { signOutView(); return; }
    loadList(); startPolling();
  }
  function makeDraft(raw = window.COUNCIL_DISCUSSION?.snapshot?.(), roomId = "") {
    if (!raw) { error = t("actionError"); render(); return; }
    requestVersion++; loading = false;
    draft = {raw,roomId,kind:"full",preview:null,allEntries:[]};
    selectedEntries.clear(); selectedFriends.clear(); view = "choose"; error = ""; notice = "";
    loadFriends(); render();
  }
  async function authorizedRoom(roomId) {
    const response = await fetch(`/api/rooms?id=${encodeURIComponent(roomId)}`, {credentials:"same-origin",cache:"no-store"});
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.room?.s || data.me?.role !== "host") {
      throw Object.assign(new Error(), {code:response.status === 401 ? "signin_required" : "owner_only"});
    }
    return data.room.s;
  }
  async function createFromRoom(roomId) {
    if (!signedIn() || busy || !roomId) { if (!signedIn()) openList(); return; }
    openList();
    const version = ++requestVersion, own = generation;
    draft = null; view = "room-loading"; loading = true; render();
    try {
      const raw = await authorizedRoom(roomId);
      if (!active || own !== generation || version !== requestVersion || !signedIn()) return;
      makeDraft(JSON.parse(JSON.stringify(raw)), String(roomId));
    } catch (err) {
      if (!active || own !== generation || version !== requestVersion) return;
      loading = false; view = "list"; actionError(err); render();
    }
  }
  function actionError(err, clearPrivateView = false) {
    const code = err?.code || "";
    if (code === "share_unavailable" || err?.status === 404) {
      shareDetail = null; selectedId = ""; error = t("unavailable"); view = "list";
    } else if (code === "signin_required") signOutView();
    else if (clearPrivateView && (code === "owner_only" || err?.status == null)) {
      shareDetail = null; selectedId = ""; listData = null; error = t("loadError"); view = "list";
    }
    else error = t(code) !== code ? t(code) : t("actionError");
  }
  async function upload() {
    if (!draft || busy || !signedIn()) return;
    if (!selectedFriends.size) { error = t("selectAtLeast"); render(); return; }
    if (draft.kind === "insights" && !selectedEntries.size) { error = t("noSelectedMessages"); render(); return; }
    const snapshot = draft.preview;
    if (!validateSnapshot(snapshot)) { error = t("tooLong"); render(); return; }
    if (!window.confirm(t("confirmUpload"))) return;
    const own = generation, version = ++requestVersion;
    busy = true; error = ""; render();
    try {
      // Validate live access again, but never replace the exact preview with
      // newer messages that the host did not review for these recipients.
      if (draft.roomId) await authorizedRoom(draft.roomId);
      if (!active || !signedIn() || own !== generation || version !== requestVersion) return;
      const result = await request({action:"create",snapshot,friendIds:[...selectedFriends]});
      if (!active || !signedIn() || own !== generation || version !== requestVersion) return;
      notice = t("created"); busy = false;
      listData = null;
      const newId = result?.share?.id || result?.id;
      if (newId) { selectedId = String(newId); shareDetail = result?.share ? result : null; view = "detail"; if (!shareDetail) loadDetail(selectedId); }
      else { view = "list"; tab = "owned"; loadList(); }
      render();
    } catch (err) {
      if (!active || own !== generation || version !== requestVersion) return;
      busy = false; actionError(err); render();
    }
  }
  async function manageAction(body) {
    if (busy || !signedIn()) return;
    const own = generation, version = ++requestVersion;
    busy = true; error = ""; render();
    try {
      const data = await request(body);
      if (!active || !signedIn() || own !== generation || version !== requestVersion) return;
      busy = false; confirmAction = null; notice = body.action === "delete" ? t("deleted") : "";
      if (body.action === "delete") { shareDetail = null; selectedId = ""; view = "list"; await loadList(); }
      else { if (data?.share) shareDetail = data; else await loadDetail(selectedId); }
    } catch (err) {
      if (!active || own !== generation || version !== requestVersion) return;
      busy = false; confirmAction = null; actionError(err, true);
    }
    render();
  }
  function openCreate() {
    if (!signedIn()) { openList(); return; }
    if (!active) openList();
    makeDraft();
    render();
  }
  let tab = "owned";
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-shares-open],[data-shares-create]");
    if (!trigger) return;
    e.preventDefault(); e.stopPropagation();
    if (trigger.hasAttribute("data-shares-create")) openCreate(); else openList();
  }, true);
  document.addEventListener("click", e => {
    if (active && dialog?.contains(e.target)) e.stopPropagation();
    const action = e.target.closest("[data-cs-action]");
    if (action && dialog?.contains(action)) {
      const a = action.dataset.csAction;
      if (busy && a !== "close") return;
      if (a === "close") close();
      else if (a === "retry") loadList();
      else if (a === "retry-friends") loadFriends();
      else if (a === "add-friend") { close(); document.querySelector("[data-friends-open]")?.click(); }
      else if (a === "sign-in") { close(); window.COUNCIL_DISCUSSION?.signIn?.(); }
      else if (a === "new") makeDraft();
      else if (a === "back") { view = "list"; shareDetail = null; selectedId = ""; error = ""; loadList(); }
      else if (a === "tab") { tab = action.dataset.tab === "received" ? "received" : "owned"; render(); }
      else if (a === "open") { selectedId = action.dataset.id || ""; view = "detail"; shareDetail = null; error = ""; loadDetail(selectedId); }
      else if (a === "preview") {
        error = "";
        draft.allEntries = draft.kind === "insights" ? (Array.isArray(draft.raw.messages) ? draft.raw.messages.filter(m => m && m.type === "persona" && typeof m.text === "string" && m.text.trim()).map((m,i) => ({author:window.COUNCIL_DISCUSSION?.personaName?.(m.pid,draft.raw) || t("chair"),text:m.text,demo:!!(m.demo || draft.raw.example),persona:true,index:i})) : []) : [];
        const built = localSnapshot(draft.raw, draft.kind);
        draft.preview = built;
        if (!selectedFriends.size) { error = t("selectAtLeast"); render(); }
        else if (draft.kind === "insights" && !selectedEntries.size) { error = t("noSelectedMessages"); render(); }
        else if (!validateSnapshot(built)) { error = t("tooLong"); render(); }
        else { view = "preview"; render(); }
      }
      else if (a === "edit") { view = "choose"; error = ""; render(); }
      else if (a === "upload") upload();
      else if (a === "grant") {
        const friendId = dialog.querySelector("#cs-grant-select")?.value;
        if (!friendId) { error = t("selectAtLeast"); render(); }
        else { confirmAction = {type:"grant",friendId}; render(); }
      }
      else if (a === "revoke") { confirmAction = {type:"revoke",friendId:action.dataset.id}; render(); }
      else if (a === "delete") { confirmAction = {type:"delete"}; render(); }
      else if (a === "dismiss-confirm") { confirmAction = null; render(); }
      else if (a === "confirm" && confirmAction) {
        const c = confirmAction;
        if (c.type === "delete") manageAction({action:"delete",id:selectedId});
        else if (c.type === "revoke") manageAction({action:"revoke",id:selectedId,friendId:c.friendId});
        else manageAction({action:"grant",id:selectedId,friendIds:[c.friendId]});
      }
      return;
    }
    if (active && e.target.matches("[data-cs-overlay]")) close();
  }, true);
  document.addEventListener("change", e => {
    const el = e.target;
    if (el.matches("[data-cs-kind]") && draft) {
      draft.kind = el.value;
      selectedEntries.clear();
      if (draft.kind === "insights") {
        const ms = Array.isArray(draft.raw.messages) ? draft.raw.messages : [];
        let personaIndex = 0;
        ms.forEach(m => { if (m?.type === "persona" && typeof m.text === "string" && m.text.trim()) selectedEntries.add(String(personaIndex++)); });
      }
      render();
    } else if (el.matches("[data-cs-friend]")) {
      if (el.checked) selectedFriends.add(String(el.dataset.csFriend)); else selectedFriends.delete(String(el.dataset.csFriend));
    } else if (el.matches("[data-cs-entry]")) {
      if (el.checked) selectedEntries.add(String(el.dataset.csEntry)); else selectedEntries.delete(String(el.dataset.csEntry));
    }
  });
  document.addEventListener("keydown", e => {
    if (!active || !dialog) return;
    e.stopPropagation();
    if (e.key === "Escape") {
      if (confirmAction) { confirmAction = null; render(); }
      else close();
      return;
    }
    if (e.key !== "Tab") return;
    const scope = dialog.querySelector(".cs-confirm") || dialog;
    const focusables = [...scope.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
    if (!focusables.length) { e.preventDefault(); dialog.focus(); return; }
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, true);
  let authIdentity = AUTH()?.state?.email || "";
  if (AUTH()) window.addEventListener("council-auth", () => {
    const currentIdentity = AUTH()?.state?.email || "";
    if (currentIdentity !== authIdentity) {
      authIdentity = currentIdentity;
      if (active) close();
      return;
    }
    if (active && !signedIn()) signOutView();
    else if (active && signedIn()) { if (view === "list") loadList(); else if (view === "detail" && selectedId) loadDetail(selectedId); }
  });
  try { new MutationObserver(() => { if (active) render(); }).observe(root, {attributes:true,attributeFilter:["lang","dir"]}); } catch {}
  window.COUNCIL_SHARES = {
    open:openList,
    createFromDiscussion:openCreate,
    createFromRoom,
    close,
    normalizeSnapshot:localSnapshot
  };
})();

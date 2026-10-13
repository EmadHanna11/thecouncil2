/* Private, live Council rooms. Loaded after the main app and friends UI. */
(() => {
  "use strict";

  const AUTH = () => window.COUNCIL_AUTH;
  const root = document.documentElement;
  const copy = {
    en: {
      title:"Live rooms", subtitle:"A private table, shared in real time.",
      open:"Live rooms", close:"Close rooms", back:"Back to rooms", retry:"Try again",
      loading:"Loading your private rooms…", loadError:"Rooms couldn't be loaded. Please try again.",
      signIn:"Sign in to join private rooms.", signInHint:"Rooms are visible only to their host and accepted members.",
      empty:"No private rooms yet.", emptyHint:"Start one from a saved Council discussion when you are ready to think together.",
      create:"Start a room from this discussion", unavailable:"Open a discussion first to start a room.",
      host:"Host", member:"Human Council member", feedback:"Feedback contributor", viewer:"Viewer", invited:"Invitation",
      accepted:"Accepted", active:"Open", closed:"Closed", pending:"Awaiting your decision",
      question:"Question", messages:"existing messages", brief:"Decision brief included", noBrief:"No decision brief yet",
      invite:"Invite a friend", inviteHint:"Only accepted friends can be invited.", chooseFriend:"Choose a friend",
      role:"Room access", inviteAction:"Send invitation", inviting:"Sending…", remove:"Remove",
      closeRoom:"Close room", closeConfirm:"Close this room? It will remain readable but no one can contribute.",
      ai:"Ask AI to contribute", synthesize:"Write decision brief", aiDisclosure:"AI contributions use the host's account quota. The question, context and room conversation are sent to the AI provider. Human contributions are included in that conversation.",
      hostQuota:"AI usage is charged to the host's account quota.",
      acceptanceTitle:"Before you accept", accept:"Accept invitation", decline:"Decline",
      acceptanceCopy:"Accepting makes the full room visible to you: the original question and all context, every existing message, any decision brief, and all future contributions. The room currently has",
      allMessages:"All messages include human contributions. AI contributions are identified separately; AI perspectives are simulations, not the people themselves.",
      contextVisible:"All original context will be visible after acceptance.",
      feedbackHint:"Feedback is visible to everyone in this private room and included in AI context.",
      feedbackLabel:"Room feedback", sendFeedback:"Send feedback",
      submitLabel:"Your contribution", submit:"Contribute", skip:"Skip your turn",
      hostMessage:"Add a host message", send:"Send", transcript:"Room conversation",
      participants:"People at this table", activity:"Waiting for the next turn…", busy:"The room is updating…",
      inviteSent:"Invitation sent.", acceptedNotice:"You joined the room.", declinedNotice:"Invitation declined.",
      closedNotice:"Room closed.", removedNotice:"Participant removed.", sentNotice:"Contribution sent.",
      feedbackSent:"Feedback added to the room.", aiNotice:"AI turn completed.", briefNotice:"Decision brief written.",
      actionError:"That action couldn't be completed. Please retry.", roomError:"This room is no longer available.",
      saveError:"The room is too large to send safely. Nothing was submitted.",
      friendNone:"No friends are available to invite.", noHumanTurn:"It is not your turn to contribute.",
      members:"members", liveLabel:"PRIVATE", readOnly:"This room is closed and read-only.",
      roleMember:"Join the shared conversation and contribute when invited to speak.",
      roleFeedback:"Read the room and add feedback visible to all accepted participants.",
      roleViewer:"Read the room. You cannot contribute or send feedback.",
      human:"Human contribution", aiTag:"AI perspective", skipped:"Skipped turn",
      disclosure:"AI provider disclosure", friendRole:"Invite as",
      confirm:"Confirm", cancel:"Cancel", working:"Working…", currentTurn:"Your turn",
      hostTurn:"Host turn", createError:"A room couldn't be created. Please try again.",
      sessionMissing:"Start a discussion before creating a room.",
      feedbackOnly:"Feedback is shared with accepted room participants.",
      room_busy:"An AI response is in progress. Please wait.", human_turn_pending:"Wait for human members to submit or skip their turns.",
      not_your_turn:"It is not your turn to contribute.", room_closed:"This room is closed.",
      room_limit:"The room limit has been reached.", invalid_text:"Enter a contribution of 1–6,000 characters.",
      already_invited:"This friend has already been invited.", not_friend:"This connection is no longer accepted.",
      quota_exceeded:"The host has reached the daily discussion limit.", rate_limited:"The host's daily AI call limit has been reached.",
      sampling_disabled:"Live AI is unavailable. No scripted answer was added.", upstream_error:"No AI answer arrived. Please retry.",
      storage_unavailable:"Rooms could not be saved or loaded. Please retry.",
      aiBrief:"AI decision brief", waitingHuman:"Waiting for a human member's turn.", demoTag:"Scripted example", chair:"Automated chair",
      friendsError:"Friends couldn't be loaded. Try again.", retryFriends:"Reload friends", quota:"Discussions used",
      humanRound:"Invite human members to speak", no_human_members:"Invite an accepted human Council member first.",
      attend:"Attend the discussion", giveFeedback:"Give feedback", joinCouncil:"Join the council",
      inviteDiscussion:"Invite a friend to this discussion", addFriend:"Add a friend first", signInAction:"Sign in",
      inviteConsent:"I agree to share the full question, context, existing messages, decision brief and future room contributions with invited friends after they accept.",
      inviteDisclosure:"This is a live, private table. Feedback is visible to everyone in the room, and human contributions are included in AI context. AI calls use the host's allowance.",
      reuseDisclosure:"If this discussion already has an open live room, invitations use that room. Later edits in your browser are not copied into it automatically.",
      existingRoom:"This discussion already has a live room. Your friend will join its existing conversation.",
      newRoom:"After you confirm, a private live room will be created from this discussion.",
      unlimited:"Premium · unlimited AI calls",
      sharedCouncil:"Shared council", sharedBoundary:"This is a separate shared conversation. Personal edits do not sync here, and room contributions do not sync back to your personal discussion.",
      shareRoom:"Share a copy of this shared conversation", nextStep:"Next step",
      startHumanRound:"Council members have joined. Start a speaking round so they can contribute.",
      waitingAcceptance:"Waiting for your friends to accept. You can continue with a host message or an AI contribution.",
      hostGuidance:"Add a host message or ask AI to contribute. Invite a friend as a council member to include them in speaking rounds.",
      memberWaiting:"You are a council member. Waiting for the host to invite you to speak.",
      turnOwner:"Speaking turn:", contributeNow:"Contribute now", viewerGuidance:"You are attending read-only. You can read contributions but cannot send messages.",
      feedbackGuidance:"You can give feedback at any time. Everyone in this shared council can read it.",
      roomLookupError:"The shared council couldn't be opened. Please try again.",
      copyDisclosure:"The host can deliberately share fixed copies, including your contributions, with selected friends outside this room. Copies do not update automatically. Content already read or copied cannot be recalled."
    },
    ar: {
      title:"الغرف المباشرة", subtitle:"طاولة خاصة للتفكير معاً.",
      open:"الغرف المباشرة", close:"إغلاق الغرف", back:"العودة إلى الغرف", retry:"حاول مجدداً",
      loading:"جارٍ تحميل غرفك الخاصة…", loadError:"تعذّر تحميل الغرف. حاول مجدداً.",
      signIn:"سجّل الدخول للانضمام إلى الغرف الخاصة.", signInHint:"لا يرى الغرفة إلا مضيفها والأعضاء المقبولون.",
      empty:"لا توجد غرف خاصة بعد.", emptyHint:"ابدأ غرفة من نقاش محفوظ في المجلس عندما ترغبون في التفكير معاً.",
      create:"ابدأ غرفة من هذا النقاش", unavailable:"افتح نقاشاً أولاً لبدء غرفة.",
      host:"المضيف", member:"عضو بشري في المجلس", feedback:"مشارك بالملاحظات", viewer:"مشاهد", invited:"دعوة",
      accepted:"مقبول", active:"مفتوحة", closed:"مغلقة", pending:"بانتظار قرارك",
      question:"السؤال", messages:"رسائل سابقة", brief:"تتضمن خلاصة القرار", noBrief:"لا توجد خلاصة قرار بعد",
      invite:"دعوة صديق", inviteHint:"يمكن دعوة الأصدقاء المقبولين فقط.", chooseFriend:"اختر صديقاً",
      role:"صلاحية الغرفة", inviteAction:"إرسال الدعوة", inviting:"جارٍ الإرسال…", remove:"إزالة",
      closeRoom:"إغلاق الغرفة", closeConfirm:"هل تريد إغلاق هذه الغرفة؟ ستبقى قابلة للقراءة ولن يتمكن أحد من المساهمة.",
      ai:"اطلب مساهمة من الذكاء الاصطناعي", synthesize:"اكتب خلاصة القرار", aiDisclosure:"تُحتسب مساهمات الذكاء الاصطناعي من حصة حساب المضيف. يُرسل السؤال والسياق ومحادثة الغرفة إلى مزوّد الذكاء الاصطناعي. وتشمل المحادثة مساهمات البشر.",
      hostQuota:"تُحتسب استخدامات الذكاء الاصطناعي من حصة حساب المضيف.",
      acceptanceTitle:"قبل قبول الدعوة", accept:"قبول الدعوة", decline:"رفض",
      acceptanceCopy:"عند القبول ستظهر لك الغرفة كاملة: السؤال الأصلي وكل السياق، وجميع الرسائل السابقة، وأي خلاصة قرار، وكل المساهمات المستقبلية. تضم الغرفة حالياً",
      allMessages:"تتضمن الرسائل مساهمات بشرية، وتُميّز مساهمات الذكاء الاصطناعي بشكل منفصل؛ فهي محاكاة للمنظورات وليست الأشخاص أنفسهم.",
      contextVisible:"سيظهر لك كل السياق الأصلي بعد القبول.",
      feedbackHint:"تظهر الملاحظات لجميع المشاركين المقبولين في هذه الغرفة الخاصة وتُضمّن في سياق الذكاء الاصطناعي.",
      feedbackLabel:"ملاحظات الغرفة", sendFeedback:"إرسال الملاحظة",
      submitLabel:"مساهمتك", submit:"أرسل مساهمتك", skip:"تجاوز دورك",
      hostMessage:"أضف رسالة بصفتك المضيف", send:"إرسال", transcript:"محادثة الغرفة",
      participants:"الأشخاص حول الطاولة", activity:"بانتظار الدور التالي…", busy:"جارٍ تحديث الغرفة…",
      inviteSent:"تم إرسال الدعوة.", acceptedNotice:"انضممت إلى الغرفة.", declinedNotice:"تم رفض الدعوة.",
      closedNotice:"تم إغلاق الغرفة.", removedNotice:"تمت إزالة المشارك.", sentNotice:"تم إرسال المساهمة.",
      feedbackSent:"أُضيفت الملاحظة إلى الغرفة.", aiNotice:"اكتمل دور الذكاء الاصطناعي.", briefNotice:"كُتبت خلاصة القرار.",
      actionError:"تعذّر إتمام الإجراء. حاول مجدداً.", roomError:"هذه الغرفة لم تعد متاحة.",
      saveError:"الغرفة أكبر من أن تُرسل بأمان. لم يتم إرسال شيء.",
      friendNone:"لا يوجد أصدقاء متاحون لدعوتهم.", noHumanTurn:"ليس دورك للمساهمة الآن.",
      members:"أعضاء", liveLabel:"خاص", readOnly:"هذه الغرفة مغلقة ومتاحة للقراءة فقط.",
      roleMember:"شارك في المحادثة عندما يُدعى دورك.",
      roleFeedback:"اقرأ الغرفة وأضف ملاحظات يراها جميع المشاركين المقبولين.",
      roleViewer:"اقرأ الغرفة فقط؛ لا يمكنك المساهمة أو إرسال ملاحظات.",
      human:"مساهمة بشرية", aiTag:"منظور ذكاء اصطناعي", skipped:"تم تجاوز الدور",
      disclosure:"إفصاح مزوّد الذكاء الاصطناعي", friendRole:"الدعوة بصفة",
      confirm:"تأكيد", cancel:"إلغاء", working:"جارٍ التنفيذ…", currentTurn:"دورك",
      hostTurn:"دور المضيف", createError:"تعذّر إنشاء الغرفة. حاول مجدداً.",
      sessionMissing:"ابدأ نقاشاً قبل إنشاء غرفة.",
      feedbackOnly:"تُشارك الملاحظات مع المشاركين المقبولين في الغرفة.",
      room_busy:"تُكتب إجابة بالذكاء الاصطناعي الآن. يرجى الانتظار.", human_turn_pending:"انتظر حتى يرسل الأعضاء البشر مساهماتهم أو يتجاوزوا أدوارهم.",
      not_your_turn:"ليس دورك للمساهمة.", room_closed:"هذه الغرفة مغلقة.",
      room_limit:"تم بلوغ الحد الأقصى للغرفة.", invalid_text:"أدخل مساهمة من حرف إلى ٦٠٠٠ حرف.",
      already_invited:"تمت دعوة هذا الصديق بالفعل.", not_friend:"لم تعد هذه الصداقة مقبولة.",
      quota_exceeded:"بلغ المضيف الحد اليومي للنقاشات.", rate_limited:"بلغ المضيف الحد اليومي لاستدعاءات الذكاء الاصطناعي.",
      sampling_disabled:"الذكاء الاصطناعي المباشر غير متاح. لم تُضف إجابة مكتوبة مسبقاً.", upstream_error:"لم تصل إجابة الذكاء الاصطناعي. حاول مجدداً.",
      storage_unavailable:"تعذّر حفظ الغرف أو تحميلها. حاول مجدداً.",
      aiBrief:"خلاصة قرار بالذكاء الاصطناعي", waitingHuman:"بانتظار دور عضو بشري.", demoTag:"مثال مكتوب مسبقاً", chair:"منسق آلي",
      friendsError:"تعذّر تحميل الأصدقاء. حاول مجدداً.", retryFriends:"إعادة تحميل الأصدقاء", quota:"النقاشات المستخدمة",
      humanRound:"دعوة الأعضاء البشر للمساهمة", no_human_members:"ادعُ عضواً بشرياً في المجلس وانتظر قبوله أولاً.",
      attend:"حضور النقاش", giveFeedback:"إبداء الملاحظات", joinCouncil:"الانضمام إلى المجلس",
      inviteDiscussion:"دعوة صديق إلى هذا النقاش", addFriend:"أضف صديقاً أولاً", signInAction:"تسجيل الدخول",
      inviteConsent:"أوافق على مشاركة السؤال والسياق وجميع الرسائل السابقة وخلاصة القرار والمساهمات المستقبلية في الغرفة مع الأصدقاء المدعوين بعد قبول الدعوة.",
      inviteDisclosure:"هذه طاولة خاصة ومباشرة. تظهر الملاحظات للجميع في الغرفة، وتُضمّن مساهمات البشر في سياق الذكاء الاصطناعي. تُحتسب طلبات الذكاء الاصطناعي من حصة المضيف.",
      reuseDisclosure:"إذا كان لهذا النقاش غرفة مباشرة مفتوحة بالفعل، تُرسل الدعوات إلى تلك الغرفة. لا تُنسخ تعديلات المتصفح اللاحقة إليها تلقائياً.",
      existingRoom:"لهذا النقاش غرفة مباشرة بالفعل. سينضم صديقك إلى محادثتها الحالية.",
      newRoom:"بعد موافقتك، ستُنشأ غرفة مباشرة خاصة من هذا النقاش.",
      unlimited:"بريميوم · طلبات ذكاء اصطناعي غير محدودة",
      sharedCouncil:"المجلس المشترك", sharedBoundary:"هذه محادثة مشتركة منفصلة. لا تُزامن التعديلات الشخصية هنا، ولا تُزامن مساهمات الغرفة مع نقاشك الشخصي.",
      shareRoom:"شارك نسخة من هذه المحادثة المشتركة", nextStep:"الخطوة التالية",
      startHumanRound:"انضم أعضاء المجلس. ابدأ جولة حديث ليتمكنوا من المساهمة.",
      waitingAcceptance:"بانتظار قبول الأصدقاء. يمكنك إضافة رسالة بصفتك المضيف أو طلب مساهمة من الذكاء الاصطناعي.",
      hostGuidance:"أضف رسالة أو اطلب مساهمة من الذكاء الاصطناعي. ادعُ صديقاً بصفة عضو في المجلس ليشارك في جولات الحديث.",
      memberWaiting:"أنت عضو في المجلس. بانتظار دعوة المضيف لك للمساهمة.",
      turnOwner:"دور الحديث:", contributeNow:"ساهم الآن", viewerGuidance:"أنت حاضر بصفة قارئ فقط. يمكنك قراءة المساهمات ولا يمكنك إرسال رسائل.",
      feedbackGuidance:"يمكنك إبداء الملاحظات في أي وقت. يراها جميع المشاركين في هذا المجلس المشترك.",
      roomLookupError:"تعذّر فتح المجلس المشترك. حاول مجدداً.",
      copyDisclosure:"يمكن للمضيف مشاركة نسخ ثابتة، تتضمن مساهماتك، مع أصدقاء يختارهم خارج هذه الغرفة. لا تُحدّث النسخ تلقائياً، ولا يمكن سحب محتوى سبق قراءته أو نسخه."
    }
  };
  const isAr = () => (root.lang || "").toLowerCase().startsWith("ar");
  const t = key => copy[isAr() ? "ar" : "en"][key] || copy.en[key] || key;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[ch]);
  const signedIn = () => !!(AUTH() && AUTH().state && AUTH().state.signedIn);
  const icon = name => {
    const paths = {
      close:'<path d="m6 6 12 12M18 6 6 18"/>',
      lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
      refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
      people:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      spark:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
      dot:'<circle cx="12" cy="12" r="8"/>'
    };
    return `<svg class="cr-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
  };
  let active = false, overlay = null, dialog = null, view = "list", rooms = [], selected = null;
  let me = null, friends = [], error = "", notice = "", busy = false, loading = false;
  let listTimer = 0, roomTimer = 0, inFlight = false, generation = 0, lastFocus = null;
   let draftSubmit = "", draftHost = "", draftFeedback = "", draftInviteRole = "viewer", draftInviteFriend = "";
   let inviteSnapshot = null, inviteConsent = false, friendsLoading = false;
  let sharedRooms = new Map(), linkContext = "", linkRefreshAt = 0, linkRequest = 0;
  let roomAuthIdentity = AUTH()?.state?.email || "";
   let confirmClose = false, lastMessages = "", friendsError = false;
  const API = "/api/rooms";

  function addStyles() {
    if (document.getElementById("council-rooms-styles")) return;
    const style = document.createElement("style");
    style.id = "council-rooms-styles";
    style.textContent = `
      .cr-overlay{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgba(9,15,11,.58);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);animation:crFade .18s ease both}
      .cr-dialog{--cr-bg:var(--bg,#F1F2ED);--cr-surface:var(--surface,#fff);--cr-surface2:var(--surface-2,#F7F8F4);--cr-ink:var(--ink,#131715);--cr-ink2:var(--ink-2,#39403C);--cr-muted:var(--muted,#5F6862);--cr-faint:var(--faint,#858D88);--cr-line:var(--line,#DFE2DA);--cr-strong:var(--line-strong,#C6CBC2);--cr-green:var(--green,#0E7C5A);--cr-soft:var(--green-soft,#E1F0E9);--cr-brand:var(--brand,#C9522D);--cr-danger:var(--err-ink,#9C2A16);font:14px/1.55 var(--sans,"Schibsted Grotesk",system-ui,sans-serif);color:var(--cr-ink2);background:var(--cr-bg);border:1px solid var(--cr-line);border-radius:22px;box-shadow:var(--shadow-lg,0 24px 70px rgba(10,20,15,.22));width:min(960px,100%);max-height:min(93dvh,960px);display:flex;flex-direction:column;overflow:hidden;animation:crRise .22s cubic-bezier(.2,.7,.2,1) both}
      .cr-dialog[dir=rtl]{font-family:var(--ar-sans,"IBM Plex Sans Arabic",Tahoma,sans-serif);font-size:15px}.cr-dialog *{box-sizing:border-box}.cr-dialog button,.cr-dialog textarea,.cr-dialog select{font:inherit;color:inherit}.cr-dialog button{cursor:pointer}.cr-dialog button:focus-visible,.cr-dialog textarea:focus-visible,.cr-dialog select:focus-visible{outline:2px solid var(--cr-green);outline-offset:3px}
      .cr-icon{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.cr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .cr-head{display:flex;align-items:flex-start;gap:15px;padding:22px 26px 18px;border-bottom:1px solid var(--cr-line);background:var(--cr-surface)}.cr-heading{flex:1;min-width:0}.cr-kicker{margin:0 0 5px;color:var(--cr-brand);font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:700}.cr-dialog[dir=rtl] .cr-kicker{letter-spacing:0;font-size:13px}.cr-head h1{font:400 clamp(25px,3vw,34px)/1.15 var(--serif,"Newsreader",Georgia,serif);letter-spacing:-.02em;color:var(--cr-ink);margin:0}.cr-dialog[dir=rtl] .cr-head h1{font-family:var(--ar-serif,"Noto Naskh Arabic",serif);font-weight:600;letter-spacing:0;line-height:1.4}.cr-subtitle{margin:5px 0 0;color:var(--cr-muted);font-size:13px}.cr-head-actions{display:flex;align-items:center;gap:8px}.cr-close{width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--cr-line);border-radius:50%;background:var(--cr-surface2);color:var(--cr-muted);flex:none;transition:background .15s,transform .15s}.cr-close:hover{background:var(--cr-line);transform:rotate(4deg)}
      .cr-body{overflow:auto;padding:22px 26px 26px;overscroll-behavior:contain;min-height:150px}.cr-status{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;margin:0 0 14px;border-radius:11px;font-size:13px}.cr-status p{margin:0;flex:1}.cr-status.error{color:var(--cr-danger);background:var(--err-soft,#FCE8E4);border:1px solid color-mix(in srgb,var(--cr-danger) 20%,transparent)}.cr-status.success{color:var(--cr-green);background:var(--cr-soft);border:1px solid color-mix(in srgb,var(--cr-green) 20%,transparent)}.cr-status button{border:0;background:transparent;text-decoration:underline;font-weight:700}
      .cr-intro{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid var(--cr-line);border-radius:13px;background:var(--cr-surface2);color:var(--cr-muted);font-size:13px;margin-bottom:17px}.cr-intro .cr-icon{color:var(--cr-green);margin-top:2px}.cr-intro p{margin:0}
      .cr-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}.cr-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;border:1px solid var(--cr-strong);border-radius:999px;background:var(--cr-surface);color:var(--cr-ink);padding:7px 13px;font-size:12px;font-weight:650;line-height:1.15;transition:background .15s,border-color .15s,transform .12s}.cr-btn:hover{border-color:var(--cr-ink2);background:var(--cr-surface2)}.cr-btn:active{transform:translateY(1px)}.cr-btn.primary{background:var(--cr-green);border-color:var(--cr-green);color:var(--green-ink,#fff)}.cr-btn.primary:hover{filter:brightness(.94)}.cr-btn.quiet{background:transparent;border-color:transparent;color:var(--cr-muted)}.cr-btn.danger{color:var(--cr-danger)}.cr-btn.danger:hover{background:var(--err-soft,#FCE8E4)}.cr-btn:disabled{opacity:.52;cursor:not-allowed}.cr-count{margin-inline-start:auto;color:var(--cr-muted);font-size:12px}
      .cr-list{display:grid;gap:11px}.cr-room-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:17px 18px;background:var(--cr-surface);border:1px solid var(--cr-line);border-radius:15px;box-shadow:var(--shadow-sm,0 1px 2px rgba(20,30,25,.05));transition:transform .16s,border-color .16s}.cr-room-card:hover{transform:translateY(-1px);border-color:var(--cr-strong)}.cr-room-main{min-width:0}.cr-room-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}.cr-status-pill{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:3px 8px;font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;background:var(--cr-soft);color:var(--cr-green)}.cr-status-pill:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}.cr-status-pill.closed{background:var(--cr-surface2);color:var(--cr-muted)}.cr-status-pill.invited{background:color-mix(in srgb,var(--cr-brand) 12%,var(--cr-surface));color:var(--cr-brand)}.cr-room-title{margin:0;color:var(--cr-ink);font:500 19px/1.3 var(--serif,"Newsreader",Georgia,serif);overflow-wrap:anywhere}.cr-room-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px;color:var(--cr-muted);font-size:12px}.cr-room-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .cr-empty{display:grid;justify-items:center;text-align:center;padding:42px 20px 48px;border:1px dashed var(--cr-strong);border-radius:16px;background:color-mix(in srgb,var(--cr-surface2) 70%,transparent)}.cr-empty-mark{width:50px;height:50px;border-radius:17px;display:grid;place-items:center;background:var(--cr-soft);color:var(--cr-green);margin-bottom:14px}.cr-empty h2{font:500 21px var(--serif,"Newsreader",Georgia,serif);color:var(--cr-ink);margin:0 0 6px}.cr-empty p{margin:0;color:var(--cr-muted);max-width:43ch;font-size:13px}
      .cr-skeletons{display:grid;gap:11px}.cr-skeleton{height:91px;border-radius:15px;background:linear-gradient(100deg,var(--cr-surface2) 20%,var(--cr-line) 42%,var(--cr-surface2) 64%);background-size:250% 100%;animation:crShimmer 1.5s linear infinite}
      .cr-room-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:18px;align-items:start}.cr-main-col{min-width:0}.cr-side{display:grid;gap:12px;position:sticky;top:0}.cr-panel{background:var(--cr-surface);border:1px solid var(--cr-line);border-radius:15px;padding:15px;min-width:0}.cr-panel h2{font:500 17px/1.3 var(--serif,"Newsreader",Georgia,serif);color:var(--cr-ink);margin:0 0 11px}.cr-participants{list-style:none;padding:0;margin:0;display:grid;gap:9px}.cr-participant{display:flex;align-items:center;gap:9px;font-size:12px;min-width:0}.cr-avatar{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:var(--cr-soft);color:var(--cr-green);font-weight:700;font-size:11px;flex:none}.cr-participant-name{overflow-wrap:anywhere;min-width:0;flex:1;color:var(--cr-ink)}.cr-role{font-size:10px;color:var(--cr-muted)}.cr-disclosure{font-size:12px;color:var(--cr-muted);margin:0;line-height:1.55}.cr-side-actions{display:grid;gap:8px}.cr-side-actions .cr-btn{width:100%}
      .cr-transcript{border:1px solid var(--cr-line);background:var(--cr-surface);border-radius:16px;overflow:hidden}.cr-transcript-head{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--cr-line);background:var(--cr-surface2)}.cr-transcript-head h2{font:500 17px var(--serif,"Newsreader",Georgia,serif);color:var(--cr-ink);margin:0}.cr-transcript-head span{margin-inline-start:auto;font-size:11px;color:var(--cr-muted)}.cr-question{padding:17px 18px;background:color-mix(in srgb,var(--cr-soft) 48%,var(--cr-surface));border-bottom:1px solid var(--cr-line)}.cr-question-label{font-size:10px;text-transform:uppercase;letter-spacing:.11em;color:var(--cr-green);font-weight:700}.cr-question p{margin:5px 0 0;color:var(--cr-ink);font:500 17px/1.45 var(--serif,"Newsreader",Georgia,serif);white-space:pre-wrap;overflow-wrap:anywhere}.cr-context{padding:14px 18px;border-bottom:1px solid var(--cr-line);font-size:13px;color:var(--cr-muted);white-space:pre-wrap;overflow-wrap:anywhere}.cr-message{padding:15px 18px;border-bottom:1px solid var(--cr-line);animation:crFade .18s ease both}.cr-message:last-child{border-bottom:0}.cr-message-top{display:flex;align-items:center;gap:8px;margin-bottom:7px}.cr-message-author{font-size:12px;font-weight:700;color:var(--cr-ink)}.cr-message-kind{font-size:10px;border-radius:99px;padding:2px 7px;background:var(--cr-soft);color:var(--cr-green);font-weight:700}.cr-message.ai .cr-message-kind{background:color-mix(in srgb,var(--cr-brand) 12%,var(--cr-surface));color:var(--cr-brand)}.cr-message p{margin:0;color:var(--cr-ink2);white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.65}.cr-brief{padding:18px;background:color-mix(in srgb,var(--cr-brand) 7%,var(--cr-surface));border-top:2px solid var(--cr-brand)}.cr-brief h3{font:500 17px var(--serif,"Newsreader",Georgia,serif);margin:0 0 8px;color:var(--cr-ink)}.cr-brief p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.cr-empty-transcript{padding:21px 18px;color:var(--cr-muted);font-size:13px}
      .cr-compose{display:grid;gap:9px;margin-top:12px}.cr-compose label{font-size:12px;font-weight:650;color:var(--cr-ink)}.cr-compose textarea,.cr-compose select{width:100%;border:1px solid var(--cr-strong);background:var(--cr-bg);border-radius:11px;padding:10px 12px;resize:vertical;min-height:82px;line-height:1.5}.cr-compose textarea::placeholder{color:var(--cr-faint)}.cr-compose select{min-height:41px;resize:none}.cr-compose-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.cr-compose-hint{font-size:11px;color:var(--cr-muted);margin:0}.cr-compose-panel{margin-top:13px}.cr-turn{padding:10px 12px;border-radius:10px;background:var(--cr-soft);color:var(--cr-green);font-size:12px;font-weight:650;margin:0 0 11px}.cr-invitation{padding:17px;background:var(--cr-surface);border:1px solid var(--cr-line);border-radius:15px;margin:0 0 13px}.cr-invitation h2{font:500 20px var(--serif,"Newsreader",Georgia,serif);color:var(--cr-ink);margin:0 0 10px}.cr-invitation p{font-size:13px;color:var(--cr-muted);margin:0 0 10px}.cr-invitation strong{color:var(--cr-ink)}.cr-invitation .cr-disclosure{margin-top:10px}
      .cr-confirm{position:absolute;inset:0;z-index:2;display:grid;place-items:center;padding:20px;background:rgba(8,13,10,.48)}.cr-confirm-card{width:min(400px,100%);background:var(--cr-surface);border:1px solid var(--cr-line);border-radius:18px;padding:22px;box-shadow:var(--shadow-lg,0 20px 60px rgba(0,0,0,.2))}.cr-confirm-card h2{font:500 20px var(--serif,"Newsreader",Georgia,serif);margin:0 0 8px;color:var(--cr-ink)}.cr-confirm-card p{color:var(--cr-muted);margin:0 0 18px}.cr-confirm-actions{display:flex;justify-content:flex-end;gap:8px}
      .cr-dialog[aria-busy=true] .cr-btn{cursor:wait}.cr-toolbar .cr-status-pill{margin-inline-start:auto}
      @keyframes crFade{from{opacity:0}to{opacity:1}}@keyframes crRise{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}@keyframes crShimmer{to{background-position:-250% 0}}
      @media(max-width:720px){.cr-overlay{padding:0;place-items:end center}.cr-dialog{width:100%;max-height:96dvh;border-radius:20px 20px 0 0;border-bottom:0}.cr-head{padding:18px 17px 14px}.cr-body{padding:16px 16px max(22px,env(safe-area-inset-bottom))}.cr-room-layout{grid-template-columns:1fr}.cr-side{position:static;grid-template-columns:1fr 1fr}.cr-side .cr-panel:first-child{grid-column:1/-1}.cr-room-card{grid-template-columns:1fr}.cr-room-actions{justify-content:flex-start}.cr-room-title{font-size:18px}.cr-head-actions .cr-btn{min-height:34px;padding:6px 10px}.cr-list{gap:9px}}
      @media(max-width:440px){.cr-side{grid-template-columns:1fr}.cr-side .cr-panel:first-child{grid-column:auto}.cr-room-meta{font-size:11px}.cr-room-card{padding:14px}.cr-body{padding-inline:13px}.cr-compose-actions .cr-btn{flex:1}.cr-head-actions .cr-btn{font-size:11px}}
      @media(prefers-reduced-motion:reduce){.cr-overlay,.cr-dialog,.cr-message,.cr-skeleton,.cr-confirm-card{animation:none!important}.cr-btn,.cr-close,.cr-room-card{transition:none!important}}
      .cr-next-step{border-inline-start:3px solid var(--cr-green);margin-bottom:14px}
      .cr-participant{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center}
      .cr-participant-name{grid-column:2;grid-row:1}
      .cr-participant>.cr-avatar{grid-column:1;grid-row:1}
      .cr-participant>.cr-btn{grid-column:3;grid-row:1}
      .cr-participant>.cr-role{grid-column:2 / -1;grid-row:2;justify-self:start;white-space:normal}
      .cr-next-step h2{font-size:16px;margin:0 0 7px}.cr-next-step p{margin:0 0 10px}
      .cr-room-boundary{margin:0 0 12px;font-size:13px;color:var(--cr-muted)}
      .cr-dialog input:focus-visible{outline:2px solid var(--cr-green);outline-offset:3px}
      .cr-dialog input[type="checkbox"]{width:22px;height:22px;flex:none;accent-color:var(--cr-green)}
      @media(max-width:640px){.cr-btn,.cr-head-actions .cr-btn{min-height:44px;min-width:44px}.cr-close{width:44px;height:44px}.cr-next-step .cr-btn{width:100%}}
    `;
    document.head.appendChild(style);
  }
  async function request(body, query = "") {
    const response = await fetch(`${API}${query}`, {
      method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store",
      ...(body ? {headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || "Room request failed"), {code:data.code || "", status:response.status});
    return data;
  }
  function errorText(err, fallback = "actionError") {
    if (err?.status === 404 || err?.code === "room_unavailable" || err?.code === "room_not_found" || err?.code === "not_a_member") return t("roomError");
    const codes = {
      signin_required:"signIn", room_not_found:"roomError", not_a_member:"roomError",
      room_too_large:"saveError", payload_too_large:"saveError", prompt_too_large:"saveError", invalid_session:"createError"
    };
    return t(codes[err?.code] || (copy.en[err?.code] ? err.code : fallback));
  }
  function statusHTML() {
    if (error) return `<div class="cr-status error" role="alert">${icon("close")}<p>${esc(error)}</p>${error === t("loadError") ? `<button type="button" data-room-action="retry">${esc(t("retry"))}</button>` : ""}</div>`;
    if (busy) return `<div class="cr-status" role="status" aria-live="polite">${icon("refresh")}<p>${esc(t("busy"))}</p></div>`;
    return notice ? `<div class="cr-status success" role="status" aria-live="polite">${icon("check")}<p>${esc(notice)}</p></div>` : "";
  }
  function safeRoomStatus(room) {
    if (room?.closed || room?.status === "closed") return "closed";
    if (room?.status === "invited" || room?.status === "pending") return "invited";
    return "active";
  }
  function roomRows() {
    if (!rooms.length) return `<div class="cr-empty"><span class="cr-empty-mark">${icon("people")}</span><h2>${esc(t("empty"))}</h2><p>${esc(t("emptyHint"))}</p></div>`;
    return `<div class="cr-list">${rooms.map(room => {
      const invited = room.status === "invited" || room.status === "pending";
      const count = Number(room.history?.messages) || 0;
      const badge = invited ? t("invited") : safeRoomStatus(room) === "closed" ? t("closed") : t("active");
      return `<article class="cr-room-card"><div class="cr-room-main"><div class="cr-room-top"><span class="cr-status-pill ${invited?"invited":safeRoomStatus(room)}">${esc(badge)}</span><span class="cr-role">${esc(room.role === "host" ? t("host") : t(room.role || "member"))}</span></div><h2 class="cr-room-title">${esc(room.question || "—")}</h2><div class="cr-room-meta"><span>${esc(room.hostName || "")}</span><span aria-hidden="true">·</span><span>${count} ${esc(t("messages"))}</span>${room.history?.hasBrief ? `<span>${esc(t("brief"))}</span>` : ""}</div></div><div class="cr-room-actions">${invited ? `<button class="cr-btn primary" type="button" data-room-action="preview" data-id="${esc(room.id)}">${esc(t("accept"))}</button>` : `<button class="cr-btn" type="button" data-room-action="open-room" data-id="${esc(room.id)}">${esc(room.closed ? t("closed") : t("open"))}</button>`}</div></article>`;
    }).join("")}</div>`;
  }
  function initials(name) {
    const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts[0][0] + parts.at(-1)[0] : parts[0].slice(0,2)).toLocaleUpperCase();
  }
  function participantRows() {
    const people = [{id:selected?.room?.hostId,name:selected?.room?.hostName,role:"host",status:"accepted"}, ...(selected?.room?.participants || [])];
    if (!people.length) return `<p class="cr-compose-hint">—</p>`;
    return `<ul class="cr-participants">${people.map(person => `<li class="cr-participant"><span class="cr-avatar" aria-hidden="true">${esc(initials(person.name))}</span><span class="cr-participant-name">${esc(person.name || "")}${person.status === "pending" ? ` · ${esc(t("pending"))}` : ""}</span><span class="cr-role">${esc(t(person.role || "member"))}</span>${selected.me?.role === "host" && !selected.room?.closed && person.id !== selected.room?.hostId ? `<button class="cr-btn quiet" type="button" data-room-action="remove" data-id="${esc(person.id)}" aria-label="${esc(t("remove"))}: ${esc(person.name || "")}">${esc(t("remove"))}</button>` : ""}</li>`).join("")}</ul>`;
  }
  function messageRows() {
    const room = selected?.room || {};
    const s = room.s || {};
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const q = s.question || room.question || "";
    const context = s.context || "";
    const brief = s.synthesis || "";
    return `<div class="cr-transcript" aria-labelledby="cr-transcript-title"><div class="cr-transcript-head"><h2 id="cr-transcript-title">${esc(t("transcript"))}</h2><span>${messages.length} ${esc(t("messages"))}</span></div>${q ? `<div class="cr-question"><span class="cr-question-label">${esc(t("question"))}</span><p>${esc(q)}</p></div>` : ""}${context ? `<div class="cr-context">${esc(context)}</div>` : ""}${messages.length ? messages.map(message => {
      const kind = message.contributionKind || (message.type === "persona" || message.pid ? "ai" : "human");
      const isAI = kind === "ai" || kind === "persona";
      const automated = ["mod","recap","event"].includes(message.type);
      const author = automated ? t("chair") : isAI ? (message.personaName || (message.pid && window.COUNCIL_DISCUSSION?.personaName?.(message.pid,s)) || message.authorName || t("aiTag")) : (message.authorName || (message.type === "host" ? t("host") : t("human")));
      const skipped = message.contributionKind === "skip";
      const text = message.text || message.content || message.body || "";
      return `<article class="cr-message ${isAI ? "ai" : "human"}"><div class="cr-message-top"><span class="cr-message-author">${esc(author)}</span><span class="cr-message-kind">${esc(skipped ? t("skipped") : automated ? t("chair") : isAI ? (message.demo ? t("demoTag") : t("aiTag")) : t("human"))}${message.contributionKind === "feedback" ? ` · ${esc(t("feedback"))}` : ""}</span></div>${text ? `<p dir="auto">${esc(text)}</p>` : ""}</article>`;
    }).join("") : `<div class="cr-empty-transcript">${esc(t("activity"))}</div>`}${brief ? `<section class="cr-brief"><h3>${esc(s.synthDemo ? t("demoTag") : t("aiBrief"))}</h3><p dir="auto">${esc(brief)}</p></section>` : ""}</div>`;
  }
  function composePanel(label, id, value, action, buttons, hint = "") {
    return `<section class="cr-panel cr-compose-panel"><form class="cr-compose" data-room-form="${action}"><label for="${id}">${esc(label)}</label><textarea id="${id}" name="text" maxlength="6000" required ${busy || selected?.room?.busy ? "disabled" : ""} placeholder="${esc(label)}">${esc(value)}</textarea>${hint ? `<p class="cr-compose-hint">${esc(hint)}</p>` : ""}<div class="cr-compose-actions">${buttons}</div></form></section>`;
  }
  function nextStepPanel(room, role) {
    const members = (room.participants || []).filter(p => p.role === "member" && p.status === "accepted");
    const turnPerson = room.humanTurn === room.hostId ? room.hostName
      : (room.participants || []).find(p => p.id === room.humanTurn)?.name;
    const ownTurn = room.humanTurn && room.humanTurn === selected?.me?.id;
    let message = t("memberWaiting"), action = "";
    if (room.closed) message = t("readOnly");
    else if (role === "viewer") message = t("viewerGuidance");
    else if (role === "feedback") {
      message = t("feedbackGuidance");
      action = `<button class="cr-btn primary" data-room-action="go-compose">${esc(t("giveFeedback"))}</button>`;
    } else if (ownTurn) {
      message = t("currentTurn");
      action = `<button class="cr-btn primary" data-room-action="go-compose">${esc(t("contributeNow"))}</button>`;
    } else if (room.humanTurn) message = `${t("turnOwner")} ${turnPerson || t("waitingHuman")}`;
    else if (role === "host" && members.length) {
      message = t("startHumanRound");
      action = `<button class="cr-btn primary" data-room-action="human-round" ${busy || room.busy ? "disabled" : ""}>${esc(t("humanRound"))}</button>`;
    } else if (role === "host") {
      message = t((room.participants || []).some(p => p.status === "pending") ? "waitingAcceptance" : "hostGuidance");
    }
    return `<section class="cr-panel cr-next-step" aria-labelledby="cr-next-step-title"><h2 id="cr-next-step-title">${esc(t("nextStep"))}</h2><p>${esc(message)}</p>${action}</section>`;
  }
  function roomView() {
    const room = selected?.room || {};
    const role = selected?.me?.role || "viewer";
    const host = role === "host", closed = !!room.closed;
    const humanTurn = !closed && room.humanTurn === selected?.me?.id && role !== "viewer" && role !== "feedback";
    let controls = "";
    if (closed) controls = `<p class="cr-turn">${esc(t("readOnly"))}</p>`;
    else if (role === "feedback") controls = composePanel(t("feedbackLabel"),"cr-feedback",draftFeedback,"feedback",`<button class="cr-btn primary" type="submit" ${busy?"disabled":""}>${icon("send")}${esc(t("sendFeedback"))}</button>`,t("feedbackHint"));
    else if (host) {
      const hostTurn = room.humanTurn === selected?.me?.id;
      controls = `${hostTurn ? `<p class="cr-turn">${esc(t("currentTurn"))}</p>${composePanel(t("submitLabel"),"cr-submit",draftSubmit,"submit",`<button class="cr-btn primary" type="submit" ${busy?"disabled":""}>${icon("send")}${esc(t("submit"))}</button><button class="cr-btn" type="button" data-room-action="skip" ${busy?"disabled":""}>${esc(t("skip"))}</button>`)}` : ""}${composePanel(t("hostMessage"),"cr-host-message",draftHost,"host-message",`<button class="cr-btn primary" type="submit" ${busy?"disabled":""}>${icon("send")}${esc(t("send"))}</button>`)}${hostTools()}`;
    } else if (humanTurn) {
      controls = `<p class="cr-turn">${esc(t("currentTurn"))}</p>${composePanel(t("submitLabel"),"cr-submit",draftSubmit,"submit",`<button class="cr-btn primary" type="submit" ${busy?"disabled":""}>${icon("send")}${esc(t("submit"))}</button><button class="cr-btn" type="button" data-room-action="skip" ${busy?"disabled":""}>${esc(t("skip"))}</button>`)}`;
    } else controls = `<p class="cr-turn">${esc(room.humanTurn ? t("activity") : t("activity"))}</p>`;
    const invitePanel = host && !closed ? `<section class="cr-panel"><h2>${esc(t("invite"))}</h2><p class="cr-compose-hint">${esc(t("inviteHint"))}</p>${friendsError ? `<p role="alert">${esc(t("friendsError"))}</p><button class="cr-btn" data-room-action="retry-friends">${esc(t("retryFriends"))}</button>` : ""}${!friends.length && !friendsError ? `<button class="cr-btn" data-room-action="add-friend">${esc(t("addFriend"))}</button>` : ""}<form class="cr-compose" data-room-form="invite"><label for="cr-friend">${esc(t("chooseFriend"))}</label><select id="cr-friend" required ${busy?"disabled":""}>${friends.length ? `<option value="">${esc(t("chooseFriend"))}</option>${friends.map(friend=>`<option value="${esc(friend.id)}">${esc(friend.name)}</option>`).join("")}` : `<option value="">${esc(t("friendNone"))}</option>`}</select><label for="cr-role">${esc(t("friendRole"))}</label><select id="cr-role" aria-describedby="cr-role-help" ${busy?"disabled":""}>${roleOptions()}</select><p id="cr-role-help" class="cr-compose-hint">${esc(t(draftInviteRole === "member" ? "roleMember" : draftInviteRole === "feedback" ? "roleFeedback" : "roleViewer"))}</p><button class="cr-btn primary" type="submit" ${busy||!friends.some(f=>f.id===draftInviteFriend)?"disabled":""}>${icon("people")}${esc(t("inviteAction"))}</button></form></section>` : "";
    return `<p class="cr-room-boundary">${esc(t("sharedBoundary"))}</p>${host ? `<div class="cr-toolbar"><button class="cr-btn" data-room-action="share-room" ${busy || room.busy ? "disabled" : ""}>${esc(t("shareRoom"))}</button></div>` : ""}<div class="cr-room-layout"><div class="cr-main-col">${nextStepPanel(room, role)}<div class="cr-intro">${icon("lock")}<p>${esc(role === "host" ? t("hostQuota") : t(role === "feedback" ? "roleFeedback" : role === "viewer" ? "roleViewer" : "roleMember"))}</p></div>${messageRows()}${controls}</div><aside class="cr-side"><section class="cr-panel"><h2>${esc(t("participants"))}</h2>${participantRows()}</section><section class="cr-panel"><h2>${esc(t("disclosure"))}</h2><p class="cr-disclosure">${esc(t("aiDisclosure"))}</p></section>${invitePanel}${host && !closed ? `<section class="cr-panel cr-side-actions"><button class="cr-btn danger" type="button" data-room-action="confirm-close">${esc(t("closeRoom"))}</button></section>` : ""}</aside></div>`;
  }
  function hostTools() {
    const disabled = busy || selected?.room?.busy || selected?.room?.humanTurn;
    return `<section class="cr-panel cr-compose-panel cr-side-actions"><p class="cr-disclosure">${esc(t("aiDisclosure"))}</p><p class="cr-disclosure">${AUTH()?.state?.unlimited ? esc(t("unlimited")) : `${esc(t("quota"))}: ${Number(AUTH()?.state?.used) || 0} / ${Number(AUTH()?.state?.limit) || 2}`}</p>${selected?.room?.humanTurn ? `<p class="cr-turn">${esc(t("waitingHuman"))}</p>` : ""}<button class="cr-btn primary" type="button" data-room-action="ai-contribute" ${disabled?"disabled":""}>${icon("spark")}${esc(t("ai"))}</button><button class="cr-btn" type="button" data-room-action="ai-synthesize" ${disabled?"disabled":""}>${esc(t("synthesize"))}</button></section>`;
  }
  function previewView() {
    const room = selected;
    const count = Number(room?.history?.messages) || 0;
    return `<section class="cr-invitation"><h2>${esc(room?.question || "—")}</h2><p><strong>${esc(t(room?.role || "viewer"))}</strong> · ${esc(t(room?.role === "feedback" ? "roleFeedback" : room?.role === "member" ? "roleMember" : "roleViewer"))}</p><p>${esc(t("acceptanceCopy"))} <strong>${count} ${esc(t("messages"))}</strong>${room?.history?.hasBrief ? ` ${esc(t("brief"))}` : ""}.</p><p>${esc(t("contextVisible"))}</p><p class="cr-disclosure">${esc(t("allMessages"))}</p><p class="cr-disclosure">${esc(t("aiDisclosure"))}</p><p class="cr-disclosure">${esc(t("copyDisclosure"))}</p><div class="cr-compose-actions"><button class="cr-btn primary" type="button" data-room-action="accept" ${busy?"disabled":""}>${icon("check")}${esc(t("accept"))}</button><button class="cr-btn danger" type="button" data-room-action="decline" ${busy?"disabled":""}>${esc(t("decline"))}</button></div></section>`;
  }
  function bodyHTML() {
    if (!signedIn()) return `<div class="cr-empty"><span class="cr-empty-mark">${icon("lock")}</span><h2>${esc(t("signIn"))}</h2><p>${esc(t("signInHint"))}</p><button class="cr-btn primary" data-room-action="sign-in">${esc(t("signInAction"))}</button></div>`;
    if (view === "invite") return invitationForm();
    if (loading && !rooms.length && view === "list") return `<div class="cr-skeletons" aria-busy="true"><div class="cr-skeleton"></div><div class="cr-skeleton"></div><div class="cr-skeleton"></div><span class="cr-sr">${esc(t("loading"))}</span></div>`;
    if (view === "preview") return `${previewView()}`;
    if (view === "room" && loading) return `<div class="cr-skeletons" aria-busy="true"><div class="cr-skeleton"></div><div class="cr-skeleton"></div><span class="cr-sr">${esc(t("loading"))}</span></div>`;
    if (view === "room") return roomView();
    const snapshot = safeSnapshot();
    const canCreate = !!snapshot;
    return `<div class="cr-toolbar">${canCreate ? `<button class="cr-btn primary" type="button" data-room-action="create" ${busy?"disabled":""}>${icon("people")}${esc(t("create"))}</button>` : `<span class="cr-compose-hint">${esc(t("unavailable"))}</span>`}<span class="cr-status-pill">${esc(t("liveLabel"))}</span><span class="cr-count">${rooms.length}</span></div>${error && !rooms.length ? `<div class="cr-empty"><span class="cr-empty-mark">${icon("refresh")}</span><h2>${esc(t("loadError"))}</h2><button class="cr-btn" type="button" data-room-action="retry">${esc(t("retry"))}</button></div>` : roomRows()}`;
  }
  function roleOptions() {
    return `<option value="viewer">${esc(t("attend"))}</option><option value="feedback">${esc(t("giveFeedback"))}</option><option value="member">${esc(t("joinCouncil"))}</option>`;
  }
  function invitationForm() {
    if (!inviteSnapshot) return `<p class="cr-compose-hint">${esc(t("sessionMissing"))}</p>`;
    if (friendsLoading || loading) return `<p role="status">${esc(t("loading"))}</p>`;
    if (friendsError) return `<p role="alert">${esc(t("friendsError"))}</p><button class="cr-btn" data-room-action="retry-friends">${esc(t("retryFriends"))}</button>`;
    if (error) return `<p role="alert">${esc(error)}</p><button class="cr-btn" data-room-action="retry">${esc(t("retry"))}</button>`;
    if (!friends.length) return `<section class="cr-panel"><h2>${esc(t("friendNone"))}</h2><p>${esc(t("inviteHint"))}</p><button class="cr-btn primary" data-room-action="add-friend">${esc(t("addFriend"))}</button></section>`;
    const existing = rooms.some(r => r.role === "host" && !r.closed && r.discussionId === inviteSnapshot.id);
    return `<section class="cr-panel"><h2>${esc(inviteSnapshot.question)}</h2><p class="cr-compose-hint">${esc(t(existing ? "existingRoom" : "newRoom"))}</p><form class="cr-compose" data-room-form="discussion-invite"><label for="cr-friend">${esc(t("chooseFriend"))}</label><select id="cr-friend" required ${busy?"disabled":""}><option value="">${esc(t("chooseFriend"))}</option>${friends.map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("")}</select><label for="cr-role">${esc(t("friendRole"))}</label><select id="cr-role" aria-describedby="cr-role-help" ${busy?"disabled":""}>${roleOptions()}</select><p id="cr-role-help" class="cr-compose-hint">${esc(t(draftInviteRole === "member" ? "roleMember" : draftInviteRole === "feedback" ? "roleFeedback" : "roleViewer"))}</p><p class="cr-disclosure">${esc(t("inviteDisclosure"))}</p><p class="cr-disclosure">${esc(t("reuseDisclosure"))}</p><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" id="cr-consent" required ${inviteConsent?"checked":""} ${busy?"disabled":""}><span>${esc(t("inviteConsent"))}</span></label><button class="cr-btn primary" type="submit" ${busy||!draftInviteFriend||!inviteConsent?"disabled":""}>${esc(t(busy ? "inviting" : "inviteAction"))}</button></form></section>`;
  }
  function render() {
    if (!dialog) return;
    const focused = document.activeElement;
    const focusId = focused?.id || "";
    const focusAction = focused?.getAttribute?.("data-room-action") || "";
    const focusForm = focused?.closest?.("[data-room-form]")?.dataset.roomForm || "";
    const scroll = dialog.querySelector(".cr-body")?.scrollTop || 0;
    const scrollBox = dialog.querySelector(".cr-transcript")?.parentElement;
    const transcriptScroll = scrollBox?.scrollTop || 0;
    const selection = focused?.tagName === "TEXTAREA" ? [focused.selectionStart, focused.selectionEnd] : null;
    const header = `<div class="cr-head"><div class="cr-heading"><p class="cr-kicker">The Council · ${esc(t(view === "room" ? "sharedCouncil" : "title"))}</p><h1 id="cr-title">${esc(view === "room" ? t("sharedCouncil") : view === "preview" ? t("acceptanceTitle") : t("title"))}</h1><p class="cr-subtitle">${esc(view === "room" ? selected?.room?.question || t("subtitle") : t("subtitle"))}</p></div><div class="cr-head-actions">${view !== "list" ? `<button class="cr-btn quiet" type="button" data-room-action="back">${esc(t("back"))}</button>` : ""}<button class="cr-close" type="button" data-room-action="close" aria-label="${esc(t("close"))}">${icon("close")}</button></div></div>`;
    dialog.innerHTML = `${header}<div class="cr-body">${statusHTML()}${bodyHTML()}</div>${confirmClose ? `<div class="cr-confirm"><section class="cr-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="cr-confirm-title" aria-describedby="cr-confirm-copy" tabindex="-1"><h2 id="cr-confirm-title">${esc(t("closeRoom"))}</h2><p id="cr-confirm-copy">${esc(t("closeConfirm"))}</p><div class="cr-confirm-actions"><button class="cr-btn" type="button" data-room-action="cancel-close">${esc(t("cancel"))}</button><button class="cr-btn danger" type="button" data-room-action="close-room" ${busy?"disabled":""}>${esc(t("confirm"))}</button></div></section></div>` : ""}`;
    dialog.setAttribute("dir", isAr() ? "rtl" : "ltr");
    dialog.setAttribute("aria-busy", busy ? "true" : "false");
    const inviteRole = dialog.querySelector("#cr-role");
    if (view === "invite") dialog.querySelector("#cr-title").textContent = t("inviteDiscussion");
    if (inviteRole) inviteRole.value = draftInviteRole;
    const inviteFriend = dialog.querySelector("#cr-friend");
    if (inviteFriend) inviteFriend.value = draftInviteFriend;
    const body = dialog.querySelector(".cr-body"); if (body) body.scrollTop = scroll;
    const tr = dialog.querySelector(".cr-transcript")?.parentElement; if (tr) tr.scrollTop = transcriptScroll;
    let target = focusId ? dialog.querySelector(`#${CSS.escape(focusId)}`) : null;
    if (!target && focusForm) target = dialog.querySelector(`[data-room-form="${CSS.escape(focusForm)}"] textarea, [data-room-form="${CSS.escape(focusForm)}"] select`);
    if (!target && focusAction) target = dialog.querySelector(`[data-room-action="${CSS.escape(focusAction)}"]`);
    if (target) { target.focus({preventScroll:true}); if (selection && target.setSelectionRange) target.setSelectionRange(...selection); }
  }
  function safeSnapshot() {
    try {
      return window.COUNCIL_DISCUSSION?.snapshot?.() || null;
    } catch { return null; }
  }
  async function loadList(initial = false) {
    if (!active || !signedIn() || inFlight || busy) return;
    if (initial) { loading = true; error = ""; render(); }
    inFlight = true;
    const token = generation;
    try {
      const data = await request(null);
      if (!active || !signedIn() || token !== generation) return;
      rooms = Array.isArray(data.rooms) ? data.rooms.map(room => {
        // Invitations are only summarized. Never retain their transcript payload.
        if (room.status === "invited" || room.status === "pending") return {
          id:room.id, hostName:room.hostName, role:room.role, status:room.status, closed:room.closed,
          question:room.question,
           history:{messages:Number(room.history?.messages) || 0, hasBrief:!!room.history?.hasBrief}
        };
        return room;
      }) : [];
      rememberRoomSummaries(rooms);
      error = ""; loading = false; render();
    } catch (err) {
      if (!active || token !== generation) return;
      loading = false;
      if (err?.code === "room_unavailable" || err?.status === 404 || err?.code === "signin_required") { clearPrivate(); return; }
      error = errorText(err, "loadError"); render();
    } finally { inFlight = false; }
  }
  async function loadRoom(id, initial = true) {
    if (!active || !signedIn() || busy) return;
    if (inFlight) { if (initial) setTimeout(() => loadRoom(id, true), 120); return; }
    if (initial) { loading = true; error = ""; render(); }
    inFlight = true;
    const token = generation;
    try {
      const data = await request(null, `?id=${encodeURIComponent(id)}`);
      if (!active || !signedIn() || token !== generation) return;
      if (!data.room) throw Object.assign(new Error(), {status:404});
      selected = {room:data.room, me:data.me};
      rememberSelectedRoom();
      me = data.me;
      const serialized = JSON.stringify(data.room.s?.messages || []);
      // Don't snap the reader back to the bottom on every poll. Preserve scroll unless new messages arrived while already near bottom.
      const transcript = dialog?.querySelector(".cr-body");
      const wasNearBottom = transcript && transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 90;
      loading = false; error = "";
      render();
      if (serialized !== lastMessages && wasNearBottom) {
        const body = dialog?.querySelector(".cr-body"); if (body) body.scrollTop = body.scrollHeight;
      }
      lastMessages = serialized;
    } catch (err) {
      if (!active || token !== generation) return;
      loading = false;
      if (err?.status === 403 || err?.status === 404 || err?.code === "signin_required") { selected = null; rooms = []; clearPrivate(); return; }
      error = errorText(err, "roomError"); render();
    } finally { inFlight = false; }
  }
  async function loadFriends() {
    const token = generation;
    friendsLoading = true; render();
    try {
      const response = await fetch("/api/friends", {credentials:"same-origin",cache:"no-store"});
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error("friends");
      if (!active || token !== generation || !signedIn()) return;
      friends = Array.isArray(data.friends) ? data.friends : []; friendsError = false;
    } catch { if (active && token === generation) { friends = []; friendsError = true; } }
    if (active && token === generation) { friendsLoading = false; render(); }
  }
  function startPolling() {
    clearInterval(listTimer); clearInterval(roomTimer);
    if (view === "room" && selected?.room?.id) roomTimer = setInterval(() => loadRoom(selected.room.id, false), 2100);
    else if (view === "list") listTimer = setInterval(() => loadList(false), 2500);
  }
  // Browsers throttle polling in background tabs. Refresh immediately when
  // the host returns so an accepted invitation is not shown as still pending.
  function refreshOnReturn() {
    if (!active || !signedIn() || document.visibilityState !== "visible") return;
    if (view === "room" && selected?.room?.id) loadRoom(selected.room.id, false);
    else if (view === "list") loadList(false);
  }
  function showList() {
    view = "list"; selected = null; draftSubmit = ""; draftHost = ""; draftFeedback = "";
    error = ""; notice = ""; lastMessages = "";
    render(); loadList(true); startPolling();
  }
  function open(mode = "list") {
    if (active) return;
    addStyles(); active = true; generation++; lastFocus = document.activeElement;
    view = mode; rooms = []; selected = null; me = null; friends = []; error = ""; notice = ""; loading = false; busy = false; inFlight = false;
    inviteSnapshot = mode === "invite" ? safeSnapshot() : null;
    inviteConsent = false; draftInviteRole = "viewer"; draftInviteFriend = ""; friendsError = false; friendsLoading = false;
    overlay = document.createElement("div"); overlay.className = "cr-overlay"; overlay.dataset.roomsOverlay = "true";
    dialog = document.createElement("section"); dialog.className = "cr-dialog"; dialog.setAttribute("role","dialog"); dialog.setAttribute("aria-modal","true"); dialog.setAttribute("aria-labelledby","cr-title"); dialog.setAttribute("tabindex","-1");
    overlay.appendChild(dialog); document.body.appendChild(overlay); document.body.style.overflow = "hidden";
    render();
    if (signedIn()) { loadFriends().then(() => { if (active) loadList(true); }); startPolling(); }
    requestAnimationFrame(() => dialog?.querySelector(".cr-close")?.focus());
  }
  function close() {
    if (!active) return;
    active = false; generation++; clearInterval(listTimer); clearInterval(roomTimer);
    rooms = []; selected = null; friends = []; me = null; draftSubmit = ""; draftHost = ""; draftFeedback = "";
    inviteSnapshot = null; inviteConsent = false; friendsLoading = false;
    notice = ""; error = ""; loading = false; busy = false; inFlight = false; confirmClose = false; lastMessages = "";
    overlay?.remove(); overlay = null; dialog = null; document.body.style.overflow = "";
    if (lastFocus?.isConnected) lastFocus.focus({preventScroll:true}); lastFocus = null;
  }
  function clearPrivate() {
    // Never leave private transcript data resident after access is lost.
    selected = null; rooms = []; friends = []; me = null; inviteSnapshot = null; inviteConsent = false;
    clearInterval(roomTimer); clearInterval(listTimer); close();
  }
  async function mutate(body, success, switchToRoom = true) {
    if (!active || busy || !signedIn()) return;
    if (inFlight) {
      const token = generation;
      await new Promise(resolve => setTimeout(resolve, 120));
      if (!active || token !== generation) return false;
      return mutate(body, success, switchToRoom);
    }
    const id = body.id;
    let serialized = "";
    try { serialized = JSON.stringify(body); } catch { error = t("saveError"); render(); return; }
    if (serialized.length > 250000) { error = t("saveError"); notice = ""; render(); return; }
    const token = generation; busy = true; inFlight = true; error = ""; notice = ""; render();
    try {
      const result = await request(body);
      if (!active || !signedIn() || token !== generation) return;
      inFlight = false;
      busy = false; error = ""; notice = success ? t(success) : "";
      confirmClose = false;
      if (body.action === "create" || body.action === "accept" || ["invite","remove","submit","skip","host-message","feedback","ai","human-round"].includes(body.action)) {
        if (body.action === "create" || body.action === "accept") {
          selected = result.room ? {room:result.room, me:result.me} : result.id ? {room:result, me:result.me || null} : result;
          if (selected?.room) { view = "room"; me = selected.me; }
        } else if (result.room) { selected = {room:result.room, me:result.me || selected?.me}; }
        else if (result.id && selected?.room) { selected = {room:result, me:result.me || selected.me}; }
        else if (switchToRoom && selected?.room?.id) { await loadRoom(selected.room.id, false); }
      }
      if (body.action === "invite") draftInviteFriend = "";
      rememberSelectedRoom();
      if (body.action === "ai") AUTH()?.refresh?.().then(() => { if (active) render(); });
      if (body.action === "decline" || body.action === "close") { showList(); return true; }
      render(); startPolling();
      if (view === "list") loadList(false);
      return true;
    } catch (err) {
      if (!active || token !== generation) return;
      busy = false; inFlight = false;
      if (err?.code === "room_unavailable" || err?.status === 404 || err?.code === "signin_required") { clearPrivate(); return; }
      error = errorText(err, body.action === "create" ? "createError" : "actionError"); notice = ""; render();
      if (body.action === "ai") AUTH()?.refresh?.();
    }
  }
  async function createRoom() {
    const s = safeSnapshot();
    if (!s) { error = t("sessionMissing"); render(); return; }
    let serialized;
    try { serialized = JSON.stringify(s); } catch { error = t("saveError"); render(); return; }
    if (serialized.length > 250000) { error = t("saveError"); render(); return; }
    inviteSnapshot = s; inviteConsent = false; view = "invite"; render();
  }
  async function sendDiscussionInvitation(friendId, role) {
    if (!active || busy || inFlight || !signedIn() || !inviteSnapshot || !inviteConsent) return;
    if (!friends.some(f => f.id === friendId) || !["viewer","feedback","member"].includes(role)) return;
    const token = generation;
    busy = true; error = ""; render();
    try {
      const created = await request({action:"create",s:inviteSnapshot,reuse:true});
      if (!active || token !== generation || !signedIn()) return;
      if (!created.room?.id || created.me?.role !== "host") throw new Error("room");
      selected = {room:created.room,me:created.me};
      const result = await request({action:"invite",id:created.room.id,friendId,role});
      if (!active || token !== generation || !signedIn()) return;
      if (result.room) selected = {room:result.room,me:result.me || created.me};
      rememberSelectedRoom();
      view = "room"; me = selected.me; draftInviteFriend = ""; inviteSnapshot = null; inviteConsent = false;
      notice = t("inviteSent"); busy = false; render(); startPolling();
    } catch (err) {
      if (!active || token !== generation) return;
      busy = false;
      if (err?.code === "signin_required") { clearPrivate(); return; }
      error = errorText(err, "actionError"); render();
      if (err?.code === "not_friend") loadFriends();
    }
  }
  function currentRoomId() { return selected?.room?.id; }
  function focusables() {
    const scope = dialog?.querySelector(".cr-confirm-card") || dialog;
    return [...(scope?.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])') || [])].filter(el => el.getClientRects().length);
  }
  document.addEventListener("click", event => {
    const roomLink = event.target.closest("[data-discussion-open-room]");
    if (roomLink) {
      event.preventDefault();
      const id = sharedRooms.get(roomLink.dataset.discussionId);
      open();
      if (id) { view = "room"; selected = {room:{id},me:null}; loadRoom(id, true); startPolling(); }
      return;
    }
    if (event.target.closest("[data-discussion-invite]")) { event.preventDefault(); open("invite"); return; }
    const openBtn = event.target.closest("[data-rooms-open]");
    if (openBtn) { event.preventDefault(); open(); return; }
    if (!active) return;
    const action = event.target.closest("[data-room-action]");
    if (!action || !dialog?.contains(action)) { if (event.target.matches("[data-rooms-overlay]")) close(); return; }
    const type = action.dataset.roomAction, id = action.dataset.id;
    if (type !== "retry") { error = ""; notice = ""; }
    switch (type) {
      case "close": close(); break;
      case "sign-in": close(); window.COUNCIL_DISCUSSION?.signIn?.(); break;
      case "share-room": {
        if (selected?.me?.role !== "host" || busy || selected.room?.busy) break;
        const roomId = currentRoomId();
        close(); window.COUNCIL_SHARES?.createFromRoom?.(roomId);
        break;
      }
      case "go-compose": {
        const input = dialog.querySelector("#cr-submit, #cr-feedback");
        input?.scrollIntoView({block:"center",behavior:"smooth"}); input?.focus({preventScroll:true});
        break;
      }
      case "add-friend": close(); document.querySelector("[data-friends-open]")?.click(); break;
      case "back": showList(); break;
      case "retry": error = ""; if (view === "room") loadRoom(currentRoomId(), true); else loadList(true); break;
       case "retry-friends": loadFriends(); break;
      case "create": createRoom(); break;
      case "preview": {
        selected = rooms.find(room => String(room.id) === String(id)) || null;
        if (selected) { view = "preview"; error = ""; render(); }
        break;
      }
      case "accept": if (selected?.id) mutate({action:"accept", id:selected.id}, "acceptedNotice"); break;
      case "decline": if (selected?.id) mutate({action:"decline", id:selected.id}, "declinedNotice", false); break;
      case "open-room": {
        view = "room"; selected = {room:{id},me:null}; error = ""; notice = ""; loadRoom(id,true); startPolling(); break;
      }
      case "skip": if (selected?.room?.humanTurn === selected?.me?.id) mutate({action:"skip",id:currentRoomId()},"sentNotice"); else {error=t("noHumanTurn");render();} break;
      case "remove": mutate({action:"remove",id:currentRoomId(),friendId:id},"removedNotice"); break;
      case "confirm-close": confirmClose = true; render(); dialog?.querySelector(".cr-confirm-card")?.focus(); break;
      case "cancel-close": confirmClose = false; render(); break;
      case "close-room": mutate({action:"close",id:currentRoomId()},"closedNotice",false); break;
      case "ai-contribute": mutate({action:"ai",id:currentRoomId(),task:"contribute"},"aiNotice"); break;
      case "ai-synthesize": mutate({action:"ai",id:currentRoomId(),task:"synthesize"},"briefNotice"); break;
       case "human-round": mutate({action:"human-round",id:currentRoomId()},""); break;
    }
  });
  document.addEventListener("input", event => {
    if (event.target?.id === "cr-submit") draftSubmit = event.target.value;
    if (event.target?.id === "cr-host-message") draftHost = event.target.value;
    if (event.target?.id === "cr-feedback") draftFeedback = event.target.value;
  });
   document.addEventListener("change", event => {
     if (event.target?.id === "cr-role") {
       draftInviteRole = event.target.value;
       const help = dialog?.querySelector("#cr-role-help");
       if (help) help.textContent = t(draftInviteRole === "member" ? "roleMember" : draftInviteRole === "feedback" ? "roleFeedback" : "roleViewer");
     }
     if (event.target?.id === "cr-consent") inviteConsent = event.target.checked;
     if (event.target?.id === "cr-friend") {
       draftInviteFriend = event.target.value;
     }
     const button = dialog?.querySelector('[data-room-form="invite"] button[type="submit"],[data-room-form="discussion-invite"] button[type="submit"]');
     if (button) button.disabled = busy || inFlight || !draftInviteFriend || (view === "invite" && !inviteConsent);
   });
  document.addEventListener("submit", event => {
    const form = event.target.closest("[data-room-form]");
    if (!active || !form) return;
    event.preventDefault();
    const id = currentRoomId(), type = form.dataset.roomForm;
    const text = String(form.querySelector("textarea")?.value || "").trim();
    error = ""; notice = "";
    if (type === "discussion-invite") {
      const friendId = form.querySelector("#cr-friend")?.value;
      const role = form.querySelector("#cr-role")?.value;
      if (form.querySelector("#cr-consent")?.checked) sendDiscussionInvitation(friendId, role);
    } else if (type === "invite") {
      const friendId = form.querySelector("#cr-friend")?.value;
      const role = form.querySelector("#cr-role")?.value || draftInviteRole;
      if (friendId) mutate({action:"invite",id,friendId,role},"inviteSent");
    } else if (!text) { error = t("actionError"); render(); }
    else if (type === "submit") {
      if (selected?.room?.humanTurn !== selected?.me?.id) { error=t("noHumanTurn");render();return; }
      mutate({action:"submit",id,text},"sentNotice").then(ok=>{ if (ok) { draftSubmit=""; render(); } });
    } else if (type === "host-message") {
      mutate({action:"host-message",id,text},"sentNotice").then(ok=>{ if (ok) { draftHost=""; render(); } });
    } else if (type === "feedback") {
      mutate({action:"feedback",id,text},"feedbackSent").then(ok=>{ if (ok) { draftFeedback=""; render(); } });
    }
  });
  document.addEventListener("keydown", event => {
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (confirmClose) { confirmClose = false; render(); }
      else close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusables();
    if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
    if (event.shiftKey && (document.activeElement === items[0] || !dialog?.contains(document.activeElement))) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && (document.activeElement === items.at(-1) || !dialog?.contains(document.activeElement))) { event.preventDefault(); items[0].focus(); }
  });
  window.addEventListener("council-auth", () => {
    if (!signedIn() && active) clearPrivate();
    else if (signedIn() && active && !rooms.length) loadList(true);
  });
  function rememberRoomSummaries(summaries) {
    sharedRooms = new Map(summaries.filter(room => room.role === "host" && !room.closed && room.discussionId).map(room => [room.discussionId, room.id]));
    updateRoomLinks();
  }
  function rememberSelectedRoom() {
    if (selected?.me?.role !== "host" || !selected.room?.s?.id) return;
    linkRequest++;
    if (selected.room.closed) sharedRooms.delete(selected.room.s.id);
    else sharedRooms.set(selected.room.s.id, selected.room.id);
    updateRoomLinks();
  }
  function updateRoomLinks() {
    document.querySelectorAll("[data-discussion-open-room]").forEach(button => {
      button.hidden = !signedIn() || !sharedRooms.has(button.dataset.discussionId);
    });
  }
  async function refreshRoomLinks(force = false) {
    const button = document.querySelector("[data-discussion-open-room]");
    if (!signedIn() || !button) { updateRoomLinks(); return; }
    const identity = AUTH()?.state?.email || "";
    const context = `${identity}:${button.dataset.discussionId}`;
    if (!force && context === linkContext && Date.now() - linkRefreshAt < 30000) { updateRoomLinks(); return; }
    linkContext = context; linkRefreshAt = Date.now();
    const token = ++linkRequest;
    try {
      const data = await request(null);
      if (token !== linkRequest || !signedIn() || identity !== AUTH()?.state?.email) return;
      rememberRoomSummaries(Array.isArray(data.rooms) ? data.rooms : []);
    } catch {
      if (token === linkRequest) { sharedRooms.clear(); updateRoomLinks(); }
    }
  }
  function mountButtons() {
    updateRoomLinks(); refreshRoomLinks();
    document.querySelectorAll(".top-actions").forEach(actions => {
      if (!actions.querySelector("[data-rooms-open]")) {
        const button = document.createElement("button");
        button.type = "button"; button.className = "btn ghost"; button.dataset.roomsOpen = "";
        button.setAttribute("aria-label",t("open"));
        button.innerHTML = `${icon("people")}<span class="new-text">${esc(t("open"))}</span>`;
        const friendsButton = actions.querySelector("[data-friends-open]");
        if (friendsButton) friendsButton.after(button); else actions.prepend(button);
      }
    });
    document.querySelectorAll('.menu[role="menu"]').forEach(menu => {
      if (menu.querySelector("[data-rooms-open]")) return;
      const button = document.createElement("button"); button.type="button";button.role="menuitem";button.dataset.roomsOpen="";
      button.innerHTML=`${icon("people")}${esc(t("open"))}`;
      const friends = menu.querySelector("[data-friends-open]");
      if (friends) friends.after(button);
      else { const hr=menu.querySelector("hr"); if(hr) hr.before(button); else menu.append(button); }
    });
  }
  const mountObserver = new MutationObserver(mountButtons);
  mountObserver.observe(document.body,{childList:true,subtree:true});
  const langObserver = new MutationObserver(() => { if(active) render(); mountButtons(); });
  langObserver.observe(root,{attributes:true,attributeFilter:["lang"]});
  document.addEventListener("visibilitychange", refreshOnReturn);
  window.addEventListener("focus", () => { refreshOnReturn(); refreshRoomLinks(true); });
  window.addEventListener("council-auth", () => {
    const identity = AUTH()?.state?.email || "";
    if (identity !== roomAuthIdentity || !signedIn()) {
      roomAuthIdentity = identity;
      linkRequest++; linkContext = ""; sharedRooms.clear();
      clearPrivate();
    }
    mountButtons();
  });
  mountButtons();
})();

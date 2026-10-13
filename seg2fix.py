def fix(seg2):
    def r(o, n):
        assert o in seg2_holder[0], "MISSING seg2: " + o[:70]
        seg2_holder[0] = seg2_holder[0].replace(o, n, 1)
    seg2_holder = [seg2]
    r('''function dropToDemo(){
  state.mode = "demo"; if (state.view !== "welcome") render();
  notify(t("Live AI isn't available in this view, so The Council is running scripted demo answers.","الذكاء الاصطناعي المباشر غير متاح هنا، لذا يعمل المجلس بإجابات توضيحية مكتوبة."));
}''', '''function dropToDemo(code){
  state.liveBlocked = code === "not_granted" ? "declined" : "disabled";
  state.mode = computeMode(); refreshChrome();
  notify(code === "not_granted" ? t("Claude access wasn't allowed, so answers are scripted. Reload the page and choose Allow to get live answers.","لم يُسمح باستخدام Claude، لذا الإجابات مكتوبة مسبقاً. أعد تحميل الصفحة واختر «سماح» لتحصل على إجابات مباشرة.") : t("Live AI isn't available for this account or view, so answers are scripted examples.","الذكاء المباشر غير متاح لهذا الحساب أو العرض، لذا الإجابات أمثلة مكتوبة."), "err");
}''')
    r('''  const res = await sample.json(prompt, { modelTier: "default" });''', r'''  let res;
  const viaText = async () => { const r = await sample(prompt + "\n\nReply with the JSON object only.", { modelTier: "default" }); const mm = String(r?.text || "").match(/\{[\s\S]*\}/); try { return mm ? JSON.parse(mm[0]) : null; } catch { return null; } };
  if (typeof sample.json === "function"){
    try { res = await sample.json(prompt, { modelTier: "default" }); }
    catch (e){ if (["capability_removed","capability_disabled","invalid_json","transform_error","invalid_request"].includes(e?.code)) res = await viaText(); else throw e; }
  } else res = await viaText();''')
    r('''  const lines = s.messages.filter(m => m.type !== "event" && m.text).map(m => {
    if (m.type === "host")''', r'''  const lines = s.messages.filter(m => m.type !== "event" && m.text && !m.demo).map(m => {
    if (m.type === "recap") return `CHAIR: ${m.text.replace(/\*\*/g, "")}`;
    if (m.type === "host")''')
    r('''  let out = lines.join("\\n\\n");
  if (out.length > maxChars)''', r'''  let out = lines.join("\n\n");
  if (s.lang === "ar" || /[؀-ۿ]/.test(out.slice(-2000))) maxChars = Math.floor(maxChars / 1.8);
  if (out.length > maxChars)''')
    r('if (p.type === "Archetype") sc += 1.2;', 'if (p.type === "Archetype") sc += 3.5;')
    r('const cat = PERSONAS.map(p =>', 'const cat = PERSONAS.filter(p => !(window.COUNCIL_SKIP || []).includes(p.id)).map(p =>')
    r('  const scored = PERSONAS.map(p => {', '  const scored = PERSONAS.filter(p => !(window.COUNCIL_SKIP || []).includes(p.id)).map(p => {')
    return seg2_holder[0]

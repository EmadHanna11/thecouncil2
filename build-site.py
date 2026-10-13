# Builds council-site/public/index.html from the artifact build (the-council.html)
from pathlib import Path
SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parent
art=(ROOT / 'the-council.html').read_text()
shim=(SOURCE / 'site-shim.js').read_text()
friends_client=(SOURCE / 'friends-client.js').read_text()
friends_ui=(SOURCE / 'friends-ui.js').read_text()
rooms_ui=(SOURCE / 'rooms-ui.js').read_text()
shares_ui=(SOURCE / 'shares-ui.js').read_text()
R=[
 ('Each contribution uses your Claude usage — you\'ll be asked to allow this once.','Answers are written live by AI.'),
 ('كل مساهمة تستخدم رصيدك في Claude، وسيُطلب إذنك مرة واحدة.','تُكتب الإجابات مباشرة بالذكاء الاصطناعي.'),
 ('— scripted answers, no Claude usage.','— scripted answers, no AI calls.'),
 ('— إجابات مكتوبة مسبقاً دون استخدام رصيد Claude.','— إجابات مكتوبة مسبقاً دون ذكاء اصطناعي.'),
 ('Live AI isn\'t reachable in this view, so answers are scripted. Open this page inside Claude (claude.ai or the Claude app), not in a separate tab.','Live AI isn\'t switched on for this site yet, so answers are scripted examples.'),
 ('الذكاء المباشر غير متاح في هذا العرض، لذا الإجابات مكتوبة مسبقاً. افتح الصفحة داخل Claude (claude.ai أو تطبيق Claude) وليس في تبويب منفصل.','الذكاء المباشر غير مفعّل على هذا الموقع بعد، لذا الإجابات أمثلة مكتوبة.'),
 ('Live AI is turned off for this account or organization, so answers are scripted examples.','Live AI is temporarily unavailable, so answers are scripted examples.'),
 ('Claude is busy or your usage limit was reached. Try again in a little while.','You\'ve reached today\'s limit on this site, or the AI is busy. Please try again later.'),
 ('Your Claude session expired. Sign in again, then retry.','The connection expired. Reload the page, then retry.'),
 ('Claude declined this request. Try rephrasing the question.','The AI declined this request. Try rephrasing the question.'),
 ('"Answers are written live by Claude on your account"','"Answers are written live by AI"'),
 ('Connecting to Claude…','Connecting to the AI…'),
 ('Still connecting to Claude. If Claude asks for permission to use AI, allow it.','Still connecting to the AI. Please wait a moment.'),
 ('ما زال الاتصال بـ Claude جارياً. إذا طلب Claude إذناً لاستخدام الذكاء الاصطناعي فاسمح به.','ما زال الاتصال بالذكاء الاصطناعي جارياً. انتظر لحظة.'),
 ('Claude is choosing your council','Choosing your council'),
 ('Chosen by Claude for this question','Chosen by AI for this question'),
 ('Claude couldn\'t choose the table this time, so we used quick picks.','The AI couldn\'t choose the table this time, so we used quick picks.'),
 ("You sign in with your Claude account — no new password. Discussions are stored in a private space only you can read (not even the page's owner) and sync across your devices. A copy is also kept in this browser.","Discussions are saved in this browser only. If sign-in is on, we store your email only to sign you in and count your daily discussions. Download a transcript to keep a copy."),
 ("In live mode, Claude writes each contribution on your account — you'll be asked to allow it once. In demo mode, answers are scripted examples.","In live mode, an AI model writes each contribution; your question and the discussion are sent to the AI provider to generate answers. In demo mode, answers are scripted examples."),
 ('Claude مشغول أو بلغت حد الاستخدام. حاول بعد قليل.','بلغت الحد اليومي على هذا الموقع أو الذكاء الاصطناعي مشغول. حاول لاحقاً.'),
 ('انتهت جلستك في Claude. سجّل الدخول ثم أعد المحاولة.','انتهى الاتصال. أعد تحميل الصفحة ثم أعد المحاولة.'),
 ('رفض Claude هذا الطلب','رفض الذكاء الاصطناعي هذا الطلب'),
 ('تُكتب الإجابات مباشرة بواسطة Claude على حسابك','تُكتب الإجابات مباشرة بالذكاء الاصطناعي'),
 ('اختارها Claude لهذا السؤال','اختارها الذكاء الاصطناعي لهذا السؤال'),
 ('تعذّر على Claude اختيار','تعذّر على الذكاء الاصطناعي اختيار'),
 ('جارٍ الاتصال بـ Claude…','جارٍ الاتصال بالذكاء الاصطناعي…'),
 ('يختار Claude مجلسك','يختار الذكاء الاصطناعي مجلسك'),
 ('In live mode Claude writes a real brief','In live mode the AI writes a real brief'),
 ('في الوضع المباشر يكتب Claude خلاصة فعلية','في الوضع المباشر يكتب الذكاء الاصطناعي خلاصة فعلية'),
 ('## حسابك\\nتسجّل الدخول بحسابك في Claude، فلا حاجة لكلمة مرور جديدة. تُحفظ نقاشاتك في مساحة خاصة بك لا يراها غيرك، حتى مالك الصفحة، وتتزامن على أجهزتك. نسخة تبقى أيضاً في هذا المتصفح.','## نقاشاتك\\nتُحفظ نقاشاتك في هذا المتصفح فقط. عند تفعيل تسجيل الدخول نحفظ بريدك فقط لتسجيل دخولك وعدّ نقاشاتك اليومية. نزّل النص للاحتفاظ بنسخة.'),
 ('في الوضع المباشر يكتب Claude كل مساهمة على حسابك، وسيُطلب إذنك مرة واحدة.','في الوضع المباشر يكتب نموذج ذكاء اصطناعي كل مساهمة، ويُرسَل سؤالك والنقاش إلى مزوّد الذكاء الاصطناعي لتوليد الإجابات.'),
]
# ---- keep prompts on the server: swap every prompt builder for a small task request ----
import sys, re, json as _json
sys.path.insert(0,str(SOURCE))
import extract_prompts as XP   # also regenerates netlify/lib/prompts.mjs + personas.json from the same source
def swap_block(src, start_pat, replacement):
    blk = XP.grab_block(src, start_pat); assert src.count(blk) == 1, start_pat
    return src.replace(blk, replacement)
art = swap_block(art, 'function contributionPrompt(s, seat)', 'function contributionPrompt(s, seat){ return { task: "contribute", s, seat }; }')
art = swap_block(art, 'function synthesisPrompt(s)', 'function synthesisPrompt(s){ return { task: "synthesize", s }; }')
art = swap_block(art, 'function personaCard(p, s)', 'function personaCard(){ return ""; }')
pk = XP.grab_block(art, 'async function pickWithAI(')
pk2 = re.sub(r'const cat = [\s\S]*?\n  const prompt = `[\s\S]*?`;\n', 'const prompt = { task: "pick", q, ctx, topic, goal, count, lang };\n', pk, count=1)
pk2 = pk2.replace('prompt + "\\n\\nReply with the JSON object only."', 'prompt')
assert pk2 != pk and '`' not in pk2.split('const prompt =')[1].split(';')[0], 'pick swap'
assert 'Reply with the JSON object only' not in pk2, 'viaText'
art = art.replace(pk, pk2)
art = re.sub(r'const LEN_RULE = \{[^\n]*\};', 'const LEN_RULE = {};', art, count=1)
art = re.sub(r'const STYLE_RULE = \{[^\n]*\};', 'const STYLE_RULE = {};', art, count=1)
n_rules = len(re.findall(r'\n    rule: "[^"\n]*"', art)); art = re.sub(r'\n    rule: "[^"\n]*"', '\n    rule: ""', art)
assert n_rules == 5, n_rules
# drop persona fields only the server needs (reasoning style, tone, sensitivity)
dm = re.search(r'(<script type="application/json" id="data">)([\s\S]*?)(</script>)', art)
D = _json.loads(dm.group(2).replace('<\\/', '</'))
_sample = [r[10] for r in D['P'] if r[10]][:3] + [r[12] for r in D['P'] if r[12]][:3]
# library shows only name, domain, tagline and "who they are"; worldview, blind spots, values, reasoning, tone stay on the server
_sample += [r[i] for r in D['P'] for i in (16, 17, 19, 20, 24) if len(r) > i and len(r[i] or "") > 40][:15]
# also hidden: typical arguments, signature questions, best-suited topics, handling guidance, sources (server-only)
for r in D['P'] + D.get('R', []):
    for i in (10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 24):
        if len(r) > i: r[i] = ""
art = art[:dm.start(2)] + _json.dumps(D, ensure_ascii=False).replace('</', '<\\/') + art[dm.end(2):]
for leak in [*_sample, 'You are voicing ONE participant', 'You are the neutral chair', 'You are assembling a council', 'Reasoning style:', 'Blind spots (let them show', 'Typical arguments (draw', 'Handling guidance (follow']:
    assert leak not in art, leak
missing=[o[:50] for o,n in R if o not in art]
for o,n in R: art=art.replace(o,n)
page='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke-width='9' stroke-linecap='round'%3E%3Cg stroke='%23121614'%3E%3Cline x1='50' y1='10' x2='50' y2='34'/%3E%3Cline x1='50' y1='10' x2='50' y2='34' transform='rotate(72 50 50)'/%3E%3Cline x1='50' y1='10' x2='50' y2='34' transform='rotate(144 50 50)'/%3E%3Cline x1='50' y1='10' x2='50' y2='34' transform='rotate(216 50 50)'/%3E%3C/g%3E%3Cline x1='50' y1='10' x2='50' y2='34' stroke='%23C9522D' transform='rotate(288 50 50)'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%230E7C5A'/%3E%3C/svg%3E">
<style>[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}</style>
'''+shim+'''</head><body>
'''+art+'''
<script>'''+friends_client+'''</script>
<script>'''+friends_ui+'''</script>
<script>'''+rooms_ui+'''</script>
<script>'''+shares_ui+'''</script>
</body></html>'''
# compress + scramble every inline script so the shipped code is hard to read or reuse
import re, subprocess, tempfile, os
def _min(m):
    src=m.group(1)
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as f: f.write(src); p=f.name
    try:
        terser = ROOT / 'website' / 'node_modules' / '.bin' / 'terser'
        if not terser.exists():
            raise RuntimeError('Missing terser. Install website dependencies with npm ci first.')
        out=subprocess.run([str(terser),p,'--compress','passes=2','--mangle','--format','comments=false,ascii_only=true'],capture_output=True,text=True,check=True).stdout
    finally: os.unlink(p)
    return '<script>'+out+'</script>'
page=re.sub(r'<script>([\s\S]*?)</script>',_min,page)
page=re.sub(r'<!--[\s\S]*?-->','',page)
output = ROOT / 'website' / 'public'
output.mkdir(parents=True, exist_ok=True)
(output / 'index.html').write_text(page)
print('site built', len(page), 'missing:', missing)

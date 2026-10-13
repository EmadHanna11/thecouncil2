from pathlib import Path
SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parent
t=(SOURCE / 'template.html').read_text()
h=(SOURCE / 'v4-head.html').read_text(); core=(SOURCE / 'v4-core.js').read_text(); a=(SOURCE / 'v4-app.js').read_text()
i0=t.index('<script type="application/json" id="data">')
seg1=t[i0:t.index('const MARK =')].replace('const LOGO = "__LOGO__";\n','')
seg2=t[t.index('/* ---------- daily questions'):t.index('function contributionPrompt(s, seat){')] + t[t.index('/* ---------- markdown'):t.index('/* ---------- rendering: header')]
o='state.mode = "demo"; renderTop();'; assert o in seg2
seg2=seg2.replace(o,'state.mode = "demo"; if (state.view !== "welcome") render();')
o='const prov = scored.find(x => x.p.domain === "Provocateurs & Thinking Modes");'; assert o in seg2
seg2=seg2.replace(o,'const prov = ["RT-0239","RT-0249","RT-0086"].map(id => scored.find(x => x.p.id === id)).find(Boolean) || scored.find(x => x.p.domain === "Provocateurs & Thinking Modes");')
from seg2fix import fix; seg2=fix(seg2)
backup = SOURCE / 'backup-utils.js'
if backup.exists():
    h += '<script>' + backup.read_text() + '</script>\n'
out=h+seg1+seg2+core+a
out=out.replace('__DATA__',(SOURCE / 'data.json').read_text().replace('</','<\\/')).replace('__LOGO_LIGHT__',(SOURCE / 'logo-light.txt').read_text()).replace('__LOGO_DARK__',(SOURCE / 'logo-dark.txt').read_text())
(ROOT / 'the-council.html').write_text(out); print('artifact built',len(out))

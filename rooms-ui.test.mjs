import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../../source/rooms-ui.js", import.meta.url), "utf8");
function client(lang = "en") {
  const window = {
    COUNCIL_AUTH: {state:{signedIn:true,email:"ui-test@example.test"}},
    addEventListener() {}
  };
  const document = {
    documentElement:{lang}, body:{},
    addEventListener() {}, querySelectorAll:() => [], querySelector:() => null
  };
  // Expose pure rendering/focus helpers only inside this isolated test runtime.
  const instrumented = source.replace(/\}\)\(\);\s*$/, `
    window.helpers = {
      nextStepPanel,
      focusables,
      select: value => { selected = value; },
      setDialog: value => { dialog = value; }
    };
  })();`);
  runInNewContext(instrumented, {window,document,MutationObserver:class {observe() {}}});
  return window.helpers;
}
const room = () => ({
  hostId:"host", hostName:"Host", closed:false, humanTurn:null,
  participants:[{id:"guest",name:"Sara",role:"member",status:"accepted"}]
});
test("host and member receive an actionable next step before a speaking round", () => {
  const helpers = client();
  helpers.select({me:{id:"host"}});
  assert.match(helpers.nextStepPanel(room(),"host"), /Council members have joined/);
  assert.match(helpers.nextStepPanel(room(),"host"), /data-room-action="human-round"/);
  helpers.select({me:{id:"guest"}});
  assert.match(helpers.nextStepPanel(room(),"member"), /Waiting for the host to invite you/);
});
test("speaking guidance names the current speaker and offers the speaker a composer shortcut", () => {
  const helpers = client();
  const active = {...room(),humanTurn:"guest"};
  helpers.select({me:{id:"host"}});
  assert.match(helpers.nextStepPanel(active,"host"), /Speaking turn: Sara/);
  helpers.select({me:{id:"guest"}});
  assert.match(helpers.nextStepPanel(active,"member"), /Contribute now/);
  assert.match(helpers.nextStepPanel(active,"member"), /data-room-action="go-compose"/);
});
test("closed rooms never offer a new speaking round, including Arabic", () => {
  const helpers = client("ar");
  helpers.select({me:{id:"host"}});
  const html = helpers.nextStepPanel({...room(),closed:true},"host");
  assert.match(html, /متاحة للقراءة فقط/);
  assert.doesNotMatch(html, /data-room-action="human-round"/);
});
test("consent inputs belong to the keyboard dialog focus list", () => {
  const helpers = client();
  let selector = "";
  const checkbox = {getClientRects:() => [1]};
  helpers.setDialog({
    querySelector:() => null,
    querySelectorAll:value => {selector=value;return [checkbox];}
  });
  assert.equal(helpers.focusables()[0],checkbox);
  assert.match(selector,/input:not\(\[disabled\]\)/);
});

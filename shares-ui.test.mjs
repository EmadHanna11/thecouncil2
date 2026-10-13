import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

// Snapshot shaping needs no network, browser storage or rendering. Check the
// exact privacy boundary in the UI, independently of the server allowlist.
const source = await readFile(new URL("../../source/shares-ui.js", import.meta.url), "utf8");
function client(lang = "en") {
  const handlers = {};
  const window = {
    COUNCIL_AUTH: { state: { signedIn: true, name: "Owner", email: "not-shared@example.test" } },
    COUNCIL_DISCUSSION: { personaName: id => `Perspective ${id}` },
    addEventListener() {}
  };
  const document = {
    documentElement: { lang }, body: {},
    addEventListener: (type, handler) => { (handlers[type] ||= []).push(handler); }
  };
  runInNewContext(source, { window, document, MutationObserver: class { observe() {} }, TextEncoder });
  return { api: window.COUNCIL_SHARES, handlers };
}
const session = () => ({
  question: "Question", context: "PRIVATE CONTEXT", synthesis: "Decision brief", synthDemo: true,
  customs: [{ id: "one", systemPrompt: "NEVER SHARE" }], preferences: { private: true },
  messages: [
    { type: "host", text: "PRIVATE HOST NOTE" },
    { type: "persona", pid: "one", text: "<script>alert('plain text')</script>", demo: true },
    { type: "mod", text: "Moderator question" },
    { type: "persona", pid: "two", text: "Chosen insight", demo: false }
  ]
});
const plain = value => JSON.parse(JSON.stringify(value));
test("mobile touch sizing explicitly overrides compact sharing toolbar buttons", () => {
  assert.match(source, /\.cs-dialog \.cs-toolbar \.cs-btn[^}]*min-height:44px/);
});
test("full client snapshot preserves content and labels but excludes private session fields", () => {
  const { api } = client();
  const snap = plain(api.normalizeSnapshot(session(), "full"));
  assert.equal(snap.entries.length, 4);
  assert.equal(snap.entries[0].author, "Owner");
  assert.equal(snap.entries[1].author, "Perspective one");
  assert.equal(snap.entries[1].text, "<script>alert('plain text')</script>");
  assert.equal(snap.entries[1].demo, true);
  assert.equal(snap.context, "PRIVATE CONTEXT");
  assert.equal(snap.brief, "Decision brief");
  assert.equal(snap.demo, true);
  assert.equal(snap.customs, undefined);
  assert.equal(snap.preferences, undefined);
  assert.equal(JSON.stringify(snap).includes("not-shared@example.test"), false);
  assert.equal(JSON.stringify(snap).includes("NEVER SHARE"), false);
});
test("brief client snapshot never carries context or transcript, including Arabic", () => {
  const { api } = client("ar");
  const raw = { ...session(), question: "سؤال خاص", synthesis: "خلاصة القرار" };
  assert.deepEqual(plain(api.normalizeSnapshot(raw, "brief")), {
    kind: "brief", question: "سؤال خاص", brief: "خلاصة القرار", demo: true
  });
});
test("insight checkbox indexes select only the chosen persona message, not adjacent host/moderator notes", () => {
  const { api, handlers } = client();
  assert.equal(api.normalizeSnapshot(session(), "insights").entries.length, 0);
  for (const handler of handlers.change) handler({ target: {
    checked: true, dataset: { csEntry: "1" }, matches: selector => selector === "[data-cs-entry]"
  } });
  assert.deepEqual(plain(api.normalizeSnapshot(session(), "insights")), {
    kind: "insights", question: "Question", demo: false,
    entries: [{ author: "Perspective two", text: "Chosen insight", demo: false }]
  });
});
test("shared council copies preserve human and AI authors without sharing identity keys", () => {
  const { api } = client();
  const raw = {
    ...session(),
    messages: [
      { type:"host", authorName:"Host", authorId:"private-host-id", text:"Opening message" },
      { type:"human", contributionKind:"feedback", authorName:"Sara", authorId:"private-guest-id", text:"Latest feedback" },
      { type:"human", contributionKind:"human", authorName:"Omar", text:"Council contribution" },
      { type:"persona", pid:"one", personaName:"Named AI perspective", text:"AI contribution" }
    ]
  };
  const snap = plain(api.normalizeSnapshot(raw, "full"));
  assert.deepEqual(snap.entries.map(entry => [entry.author,entry.text]), [
    ["Host","Opening message"], ["Sara","Latest feedback"],
    ["Omar","Council contribution"], ["Named AI perspective","AI contribution"]
  ]);
  assert.equal(JSON.stringify(snap).includes("private-guest-id"), false);
  assert.equal(JSON.stringify(snap).includes("private-host-id"), false);
  assert.equal(api.normalizeSnapshot(raw, "brief").entries, undefined);
  assert.equal(api.normalizeSnapshot(raw, "insights").context, undefined);
});

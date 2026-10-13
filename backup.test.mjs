import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const context = { globalThis: {} };
vm.runInNewContext(readFileSync(new URL("./backup-utils.js", import.meta.url), "utf8"), context);
const backup = context.globalThis.COUNCIL_BACKUPS;
const discussion = (id, question = "A useful question?") => ({
  id, question, context: "", topic: "Work", mode: "explore", goal: "Understand", lang: "en",
  count: 2, style: "balanced", length: "medium", rounds: 3, religious: "respectful",
  seats: ["RT-0001", "RT-0002"], reasons: {}, customs: [], pins: [], checks: {}, followups: [],
  messages: [{ id: "message01", type: "host", text: "Let's explore this.", to: "all" }],
  turn: 0, stage: "discuss", synthesis: "", pickedBy: "quick", createdAt: 1, updatedAt: 2
});
const pack = (...discussions) => ({ format: "the-council-backup", version: 1, exportedAt: "2025-01-01T00:00:00.000Z", discussions });

test("exports versioned data and strictly validates a normal discussion", () => {
  const json = backup.exportBackup([discussion("council01")], "2025-01-01T00:00:00.000Z");
  assert.equal(backup.validateBackup(JSON.parse(json)).ok, true);
});
test("pinning the finished example persists it for discussion backup", () => {
  const app = readFileSync(new URL("./v4-app.js", import.meta.url), "utf8");
  const saveSource = app.match(/function save\(sx\)\{[\s\S]*?\n\}/)?.[0];
  const pinAction = app.split("\n").find(line => line.includes('case "pin":'));
  assert.ok(saveSource && pinAction);
  const example = { ...discussion("example-1234"), example: true, touched: false };
  let saved;
  const sandbox = {
    state: { s: example, history: [] },
    el: { dataset: { id: example.messages[0].id } },
    $: () => null, render: () => {}, toast: () => {}, t: x => x, queueRemote: () => {},
    persistLocal() { saved = JSON.parse(JSON.stringify(sandbox.state.history)); return true; }
  };
  vm.runInNewContext(`${saveSource}\nswitch ("pin") { ${pinAction} }`, sandbox);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].touched, true);
  assert.deepEqual(saved[0].pins, [example.messages[0].id]);
  assert.equal(backup.validateBackup(pack(...saved)).ok, true);
});
test("merge prepends new discussions, preserves existing entries, and skips duplicate IDs", () => {
  const current = discussion("council01", "Keep this.");
  const incoming = discussion("council01", "Do not overwrite.") ;
  const added = discussion("council02");
  const result = backup.merge([current], pack(incoming, added));
  assert.equal(result.ok, true);
  assert.equal(result.restored, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.discussions[1].question, "Keep this.");
});
test("rejects invalid message shapes, pin references, custom personas and malformed briefs atomically", () => {
  for (const mutate of [
    x => { x.messages[0].type = "script"; },
    x => { x.pins = ["missing01"]; },
    x => { x.customs = [{ id: "custom001", type: "custom", name: "Name", html: "<img>" }]; },
    x => { x.messages[0].stance = "supportive"; },
    x => { x.messages[0].gap = { html: "<img>" }; },
    x => { x.followups = [4]; }
  ]) {
    const bad = discussion("council01"); mutate(bad);
    const result = backup.merge([discussion("existing1")], pack(bad));
    assert.equal(result.ok, false);
    assert.equal(result.restored, 0);
    assert.equal(result.discussions.length, 1);
  }
});
test("preserves code and markup as plain discussion text, not executable HTML", () => {
  const d = discussion("council01");
  d.messages[0].text = 'Explain <script>alert(1)</script>, data: URLs, and &#60; encoding.';
  d.synthesis = "A code example: <div>Hello</div>";
  const json = backup.exportBackup([d]);
  assert.equal(backup.validateBackup(JSON.parse(json)).ok, true);
  assert.equal(JSON.parse(json).discussions[0].messages[0].text, d.messages[0].text);
});
test("rejects unsupported version, over-size files, repeated imported IDs, and capacity overflow", () => {
  assert.equal(backup.validateBackup({ ...pack(discussion("council01")), version: 2 }).error, "format");
  assert.equal(backup.validateBackup({ ...pack(discussion("council01")), authToken: "not allowed" }).error, "format");
  assert.equal(backup.validateBackup(pack(discussion("council01")), backup.MAX_BYTES + 1).error, "too_large");
  assert.equal(backup.validateBackup(pack(discussion("council01"), discussion("council01"))).error, "duplicate");
  const full = Array.from({ length: backup.MAX_DISCUSSIONS }, (_, i) => ({ id: `oldrecord${i}`, updatedAt: i }));
  assert.equal(backup.merge(full, pack(discussion("council01"))).error, "capacity");
});
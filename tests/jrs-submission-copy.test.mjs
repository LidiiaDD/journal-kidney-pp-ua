import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const component = readFileSync(new URL("../app/components/SubmissionStudio.tsx", import.meta.url), "utf8");
const handler = component.match(/  async function copyLetter\(\) \{([\s\S]*?)\n  \}\n\n  return \(/);
assert.ok(handler, "actual submission copy handler remains testable");

function setup(clipboard, ready = true) {
  const messages = [];
  const manual = [];
  const written = [];
  const context = {
    ready,
    subject: "JRS — подання рукопису: Дослідження",
    letter: "Шановна редакціє!\nТекст листа українською.",
    navigator: clipboard === null ? {} : { clipboard: {
      writeText: async value => { written.push(value); if (clipboard === "denied") throw new Error("NotAllowedError"); if (typeof clipboard === "function") await clipboard(value); },
    } },
    setMessage: value => messages.push(value),
    setManualCopy: value => manual.push(value),
    copyRequest: { current: 0 },
  };
  const copy = runInNewContext("(async function copyLetter() {" + handler[1] + "\n})", context);
  return { copy, messages, manual, written, copyRequest: context.copyRequest };
}

test("blocked clipboard exposes the exact full submission text for manual copy", async () => {
  const blocked = setup("denied");
  await blocked.copy();
  assert.equal(blocked.manual.at(-1), blocked.written.at(-1));
  assert.match(blocked.manual.at(-1), /^Тема: JRS — подання рукопису: Дослідження\n\nШановна редакціє!/);
  assert.match(blocked.messages.at(-1), /скопіюйте вручну/);
});

test("unavailable clipboard also leaves the full letter selectable", async () => {
  const missing = setup(null);
  await missing.copy();
  assert.match(missing.manual.at(-1), /Текст листа українською/);
});

test("success clears old fallback; invalid form does not attempt clipboard access", async () => {
  const successful = setup("allowed");
  await successful.copy();
  assert.equal(successful.manual.at(-1), "");
  assert.equal(successful.written.length, 1);
  assert.match(successful.messages.at(-1), /скопійовано/);
  const invalid = setup("allowed", false);
  await invalid.copy();
  assert.equal(invalid.written.length, 0);
  assert.match(invalid.messages.at(-1), /Спочатку введіть/);
});

test("manual field is accessible and stale fallback clears when author edits the draft", () => {
  assert.match(component, /aria-label="Повний лист для ручного копіювання"/);
  assert.match(component, /readOnly value=\{manualCopy\}/);
  assert.match(component, /onFocus=\{event => event\.currentTarget\.select\(\)\}/);
  assert.match(component, /const update = [\s\S]*?setManualCopy\(""\);/);
  assert.match(component, /copyRequest\.current\+\+; setKind\(event\.target\.value as ManuscriptKind\); setMessage\(""\); setManualCopy\(""\);/);
});


test("a successful clipboard result cannot overwrite feedback after the author edits the draft", async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const copy = setup(() => pending);
  const operation = copy.copy();
  // The field-change handler increments the same request counter.
  copy.copyRequest.current++;
  resolve();
  await operation;
  assert.equal(copy.written.length, 1);
  assert.deepEqual(copy.messages, []);
  assert.deepEqual(copy.manual, []);
  assert.match(component, /const update = [\s\S]*?copyRequest\.current\+\+;/);
});

test("a denied stale clipboard result cannot resurrect an obsolete manual letter", async () => {
  let reject;
  const pending = new Promise((_, fail) => { reject = fail; });
  const copy = setup(() => pending);
  const operation = copy.copy();
  copy.copyRequest.current++;
  reject(new Error("NotAllowedError"));
  await operation;
  assert.equal(copy.written.length, 1);
  assert.deepEqual(copy.messages, []);
  assert.deepEqual(copy.manual, []);
});

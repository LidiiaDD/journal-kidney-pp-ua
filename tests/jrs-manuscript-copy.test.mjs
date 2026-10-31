import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const component = readFileSync(new URL("../app/components/ManuscriptNavigator.tsx", import.meta.url), "utf8");
const handler = component.match(/  async function copyRemaining\(\) \{([\s\S]*?)\n  \}\n\n  const mailto/);
assert.ok(handler, "actual checklist copy handler remains testable");

function setup(clipboard) {
  const messages = [];
  const manual = [];
  const context = {
    navigator: clipboard === null ? {} : { clipboard },
    guide: { label: "Огляд" },
    completed: 1,
    total: 3,
    remaining: ["Перевірити етику", "Уточнити методи"],
    setFeedback: value => messages.push(value),
    setManualCopy: value => manual.push(value),
  };
  const copy = runInNewContext("(async function copyRemaining() {" + handler[1] + "\n})", context);
  return { copy, messages, manual };
}

test("blocked clipboard keeps the exact outstanding checklist available for manual copy", async () => {
  const example = setup({ writeText: async () => { throw new Error("NotAllowedError"); } });
  await example.copy();
  assert.match(example.manual.at(-1), /Самоперевірка: 1 із 3/);
  assert.match(example.manual.at(-1), /1\. Перевірити етику\n2\. Уточнити методи/);
  assert.match(example.messages.at(-1), /скопіюйте вручну/);
});

test("missing or throwing clipboard getter still provides manual text", async () => {
  const absent = setup(null);
  await absent.copy();
  assert.match(absent.manual.at(-1), /JRS — Навігатор рукопису/);
  const restricted = { get writeText() { throw new Error("SecurityError"); } };
  const blocked = setup(restricted);
  await blocked.copy();
  assert.match(blocked.manual.at(-1), /Перевірити етику/);
});

test("successful retry clears stale manual text and preserves existing success feedback", async () => {
  let copied = "";
  const example = setup({ writeText: async value => { copied = value; } });
  await example.copy();
  assert.match(copied, /Уточнити методи/);
  assert.equal(example.manual.at(-1), "");
  assert.equal(example.messages.at(-1), "Список скопійовано.");
  assert.match(component, /aria-label="Список пунктів для ручного копіювання"/);
  assert.match(component, /readOnly[\s\S]*?value=\{manualCopy\}/);
  assert.match(component, /onFocus=\{event => event\.currentTarget\.select\(\)\}/);
  assert.match(component, /setKind\(item\.id\); setFeedback\(""\); setManualCopy\(""\);/);
  assert.match(component, /setChecked\(\{\}\); setManualCopy\(""\);/);
});

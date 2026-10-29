import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../app/lib/reading-list.ts", import.meta.url), "utf8");
const start = source.indexOf("function read(): readonly string[] {");
const end = source.indexOf("\nfunction subscribe(", start);
assert.ok(start >= 0 && end > start, "test must execute the real reading-list reader");
const reader = source.slice(start, end)
  .replace("function read(): readonly string[]", "function read")
  .replace("let raw: string | null = null;", "let raw = null;");

function sandbox(getItem) {
  const empty = Object.freeze([]);
  return {
    window: { localStorage: { getItem } },
    STORAGE_KEY: "jrs:reading-list:v1",
    EMPTY: empty,
    cachedRaw: undefined,
    cachedItems: empty,
    validSlugs: value => Array.isArray(value)
      ? [...new Set(value.filter(item => typeof item === "string" && /^[a-z0-9-]{3,100}$/.test(item)))].slice(0, 150)
      : [],
  };
}

test("temporary storage read failure keeps bookmarks already visible in this tab", () => {
  const state = sandbox(() => '["renal-article","another-paper"]');
  assert.deepEqual(Array.from(runInNewContext(reader + "\nread()", state)), ["renal-article", "another-paper"]);
  state.window.localStorage.getItem = () => { throw new Error("SecurityError"); };
  assert.deepEqual(Array.from(runInNewContext("read()", state)), ["renal-article", "another-paper"]);
  assert.deepEqual(Array.from(state.cachedItems), ["renal-article", "another-paper"]);
});

test("blocked storage before any successful read still starts with an empty list", () => {
  const state = sandbox(() => { throw new Error("SecurityError"); });
  assert.deepEqual(Array.from(runInNewContext(reader + "\nread()", state)), []);
});

test("a successful later read still replaces stale cached bookmarks", () => {
  const state = sandbox(() => '["first-paper"]');
  runInNewContext(reader + "\nread()", state);
  state.window.localStorage.getItem = () => { throw new Error("SecurityError"); };
  runInNewContext("read()", state);
  state.window.localStorage.getItem = () => '["second-paper"]';
  assert.deepEqual(Array.from(runInNewContext("read()", state)), ["second-paper"]);
});

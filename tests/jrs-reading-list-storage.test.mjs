import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../app/lib/reading-list.ts", import.meta.url), "utf8");
const start = source.indexOf("function read(): readonly string[] {");
const end = source.indexOf("\nfunction subscribe(", start);
assert.ok(start >= 0 && end > start, "test must execute the real reading-list reader");
const reader = source.slice(start, end)
  .replace("function read(): readonly string[]", "function read()")
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

test("bookmark toggle refuses stale writes after a blocked read and resumes after recovery", () => {
  const writes = [];
  const state = sandbox(() => '["saved-paper"]');
  state.SLUG_PATTERN = /^[a-z0-9-]{3,100}$/;
  state.lastReadFailed = false;
  state.saveReadingList = items => { writes.push(Array.from(items)); return true; };
  const start = source.indexOf("export function toggleReadingItem(slug: string): boolean {");
  assert.ok(start >= 0, "execute the actual bookmark toggle");
  const nextExport = source.indexOf("\nexport function removeUnavailableReadingItems(", start);
  const toggle = source.slice(start, nextExport > start ? nextExport : undefined).replace(
    "export function toggleReadingItem(slug: string): boolean",
    "function toggleReadingItem(slug)",
  );
  runInNewContext(reader + "\n" + toggle + "\nread()", state);
  state.window.localStorage.getItem = () => { throw new Error("SecurityError"); };
  assert.equal(runInNewContext("toggleReadingItem('new-paper')", state), false);
  assert.deepEqual(writes, [], "failed reads must never overwrite another tab's bookmarks");
  assert.deepEqual(Array.from(state.cachedItems), ["saved-paper"]);

  state.window.localStorage.getItem = () => '["saved-paper","other-tab-paper"]';
  assert.equal(runInNewContext("toggleReadingItem('new-paper')", state), true);
  assert.deepEqual(writes, [["new-paper", "saved-paper", "other-tab-paper"]]);
});

test("removing unavailable bookmarks preserves new valid bookmarks from another tab", () => {
  const writes = [];
  let raw = '["saved-paper"]';
  const state = sandbox(() => raw);
  state.lastReadFailed = false;
  state.saveReadingList = items => { writes.push(Array.from(items)); return true; };
  const start = source.indexOf("export function removeUnavailableReadingItems(allowedSlugs: readonly string[]): boolean {");
  assert.ok(start >= 0, "execute the real unavailable-bookmark cleanup");
  const cleanup = source.slice(start).replace(
    "export function removeUnavailableReadingItems(allowedSlugs: readonly string[]): boolean",
    "function removeUnavailableReadingItems(allowedSlugs)",
  );
  runInNewContext(reader + "\n" + cleanup + "\nread()", state);
  raw = '["saved-paper","newer-paper","unpublished-paper"]';
  assert.equal(runInNewContext('removeUnavailableReadingItems(["saved-paper","newer-paper"])', state), true);
  assert.deepEqual(writes, [["saved-paper", "newer-paper"]]);
});

test("removing unavailable bookmarks never writes when browser storage cannot be read", () => {
  const writes = [];
  const state = sandbox(() => '["saved-paper"]');
  state.lastReadFailed = false;
  state.saveReadingList = items => { writes.push(Array.from(items)); return true; };
  const start = source.indexOf("export function removeUnavailableReadingItems(allowedSlugs: readonly string[]): boolean {");
  const cleanup = source.slice(start).replace(
    "export function removeUnavailableReadingItems(allowedSlugs: readonly string[]): boolean",
    "function removeUnavailableReadingItems(allowedSlugs)",
  );
  runInNewContext(reader + "\n" + cleanup + "\nread()", state);
  state.window.localStorage.getItem = () => { throw new Error("SecurityError"); };
  assert.equal(runInNewContext('removeUnavailableReadingItems(["saved-paper"])', state), false);
  assert.deepEqual(writes, []);
});

test("library cleanup passes the whole public catalogue, not a stale saved snapshot", () => {
  const component = readFileSync(new URL("../app/components/ReadingLibrary.tsx", import.meta.url), "utf8");
  assert.match(component, /removeUnavailableReadingItems\(articles\.map\(article => article\.slug\)\)/);
});

test("reading-library copy failure exposes the actual article links for manual selection", async () => {
  const component = readFileSync(new URL("../app/components/ReadingLibrary.tsx", import.meta.url), "utf8");
  const start = component.indexOf("  async function copyLinks() {");
  const end = component.indexOf("\n  function download(", start);
  assert.ok(start >= 0 && end > start, "execute the real reading-list copy handler");
  const handler = component.slice(start, end);
  let manual = "";
  let notice = "";
  let attempted = "";
  const context = {
    available: [{ slug: "renal-study", title: "Renal study" }],
    articleUrl: article => "https://journal.kidney.pp.ua/publications/" + article.slug,
    navigator: { clipboard: { writeText: async text => { attempted = text; throw Error("NotAllowedError"); } } },
    setManualLinks: text => { manual = text; },
    setNotice: text => { notice = text; },
  };
  await runInNewContext(handler + "\ncopyLinks()", context);
  assert.equal(attempted, "1. Renal study\nhttps://journal.kidney.pp.ua/publications/renal-study");
  assert.equal(manual, attempted, "fallback must contain the same real links");
  assert.match(notice, /вручну/);
  assert.match(component, /\{manualLinks && \(/);
  assert.match(component, /<textarea readOnly rows=\{5\} value=\{manualLinks\}/);
  assert.match(component, /onFocus=\{event => event\.currentTarget\.select\(\)\}/);
});

test("successful later reading-list copy clears stale manual fallback", async () => {
  const component = readFileSync(new URL("../app/components/ReadingLibrary.tsx", import.meta.url), "utf8");
  const start = component.indexOf("  async function copyLinks() {");
  const end = component.indexOf("\n  function download(", start);
  const handler = component.slice(start, end);
  let manual = "old fallback";
  let copied = "";
  const context = {
    available: [{ slug: "renal-study", title: "Renal study" }],
    articleUrl: article => "https://journal.kidney.pp.ua/publications/" + article.slug,
    navigator: { clipboard: { writeText: async text => { copied = text; } } },
    setManualLinks: text => { manual = text; },
    setNotice: () => {},
  };
  await runInNewContext(handler + "\ncopyLinks()", context);
  assert.match(copied, /renal-study/);
  assert.equal(manual, "", "a successful copy should dismiss the old manual field");
});

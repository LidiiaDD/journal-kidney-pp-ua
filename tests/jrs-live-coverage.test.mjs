import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../scripts/verify-jrs-live.mjs", import.meta.url), "utf8");

function list(name) {
  const match = new RegExp("const " + name + " = \\[([\\s\\S]*?)\\];").exec(script);
  assert.ok(match, name + " must exist");
  return [...match[1].matchAll(/"\/[^"]*"/g)].map(item => JSON.parse(item[0]));
}

test("live audit enumerates all primary Ukrainian editorial routes", () => {
  const pages = list("publicPages");
  for (const route of ["/", "/publications", "/topics", "/issues",
    "/contributors", "/notices", "/submission-studio", "/editorial-policy"]) {
    assert.ok(pages.includes(route), route);
  }
});

test("live audit checks every public English discovery section", () => {
  const pages = list("publicPages");
  for (const route of ["/en", "/en/publications", "/en/topics", "/en/issues",
    "/en/contributors", "/en/notices", "/en/policy", "/en/authors"]) {
    assert.ok(pages.includes(route), route);
  }
});

test("RSS discovery and search index resources are all checked", () => {
  const resources = list("publicResources");
  assert.deepEqual(resources, ["/sitemap.xml", "/robots.txt", "/feed.xml",
    "/feeds/articles.xml", "/feeds/notices.xml"]);
  assert.match(script, /application\\\/rss\\\+xml/);
});

test("a missing advertised public route is a failed smoke check", () => {
  assert.match(script, /response\.status === 200/);
  assert.match(script, /sitemap advertises /);
  assert.match(script, /body\.includes\("https:\/\/journal\.kidney\.pp\.ua"/);
});

test("known English root language mismatch is warned about, not concealed", () => {
  assert.match(script, /WARN English document root lang is not en/);
  assert.match(script, /accessibility follow-up required/);
});

test("checks are read only, anonymous, and verify the real production commit", () => {
  assert.match(script, /redirect: "manual"/);
  assert.match(script, /method: "GET"/);
  assert.match(script, /release\?\.commit === expectedSha/);
  assert.match(script, /anonymous access denied/);
  assert.doesNotMatch(script, /method: "POST"|Authorization:|JRS_SUPABASE_\w+/);
});

test("neither public pages nor resources are duplicated", () => {
  const items = [...list("publicPages"), ...list("publicResources")];
  assert.equal(new Set(items).size, items.length);
});

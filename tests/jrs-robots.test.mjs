import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const robots = readFileSync(new URL("../app/robots.txt", import.meta.url), "utf8");
const lines = robots.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

test("JRS serves a real robots.txt for crawlers", () => {
  assert.equal(lines[0], "User-agent: *");
  assert.equal(lines.includes("Allow: /"), true);
});

test("robots.txt points to the real production sitemap", () => {
  assert.equal(lines.filter(line => line.startsWith("Sitemap:")).length, 1);
  assert.equal(lines.includes("Sitemap: https://journal.kidney.pp.ua/sitemap.xml"), true);
});

test("private editor and API endpoints are excluded from crawling", () => {
  assert.equal(lines.includes("Disallow: /admin"), true);
  assert.equal(lines.includes("Disallow: /api/"), true);
  assert.equal(lines.some(line => /Disallow:\s*\/$/.test(line)), false);
});

test("public publication and English routes are not blocked", () => {
  assert.equal(lines.some(line => /^Disallow:\s*\/(publications|topics|en|issues|notices)/.test(line)), false);
});

test("no directive suggests robots is an authorization boundary", () => {
  assert.equal(lines.some(line => /^Allow:\s*\/admin(?:\/|$)/i.test(line)), false);
  assert.equal(lines.some(line => /noindex:\s*private/i.test(line)), false);
});

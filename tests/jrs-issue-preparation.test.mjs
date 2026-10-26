import test from "node:test";
import assert from "node:assert/strict";
import { analyzeIssuePreparation } from "../app/lib/jrs-issue-preparation.ts";

const article = (overrides = {}) => ({
  id: "11111111-1111-4111-8111-111111111111",
  title: "Тестова назва з локальних перевірок",
  slug: "draft-test",
  abstract: "Тестовий опис лише для програмної перевірки.",
  authors: [{ name: "Test Author" }],
  keywords: ["ХХН"],
  type: "original-research",
  language: "uk",
  status: "draft",
  volume: null,
  issue: null,
  published_at: null,
  pdf_path: null,
  created_at: "2026-10-26T00:00:00Z",
  updated_at: "2026-10-26T00:00:00Z",
  ...overrides,
});

test("empty editorial database does not invent a first issue", () => {
  const result = analyzeIssuePreparation([]);
  assert.deepEqual(result.groups, []);
  assert.equal(result.totalDrafts, 0);
  assert.equal(result.totalPublished, 0);
  assert.equal(result.possiblyTruncated, false);
});

test("only draft assignments remain private and do not make published counts", () => {
  const result = analyzeIssuePreparation([article({ volume: "1", issue: "1" })]);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].drafts.length, 1);
  assert.equal(result.groups[0].published.length, 0);
  assert.equal(result.totalPublished, 0);
});

test("published articles and drafts share a planned group but keep distinct lists", () => {
  const result = analyzeIssuePreparation([
    article({ id: "draft-a", volume: "1", issue: "1" }),
    article({ id: "published-b", status: "published", volume: "1", issue: "1", published_at: "2026-10-25" }),
  ]);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].drafts.length, 1);
  assert.equal(result.groups[0].published.length, 1);
});

test("missing volume and issue stay outside all issue groups", () => {
  const result = analyzeIssuePreparation([
    article({ id: "a" }),
    article({ id: "b", status: "published" }),
  ]);
  assert.equal(result.groups.length, 0);
  assert.equal(result.unassignedDrafts.length, 1);
  assert.equal(result.unassignedPublished.length, 1);
});

test("partial and oversize issue fields are not treated as valid groups", () => {
  const result = analyzeIssuePreparation([
    article({ id: "a", volume: "2", issue: "" }),
    article({ id: "b", volume: "2", issue: "x".repeat(51) }),
  ]);
  assert.equal(result.groups.length, 0);
  assert.equal(result.partialDrafts.length, 1);
  assert.equal(result.invalidDrafts.length, 1);
});

test("whitespace is normalized but issue numbers are not invented", () => {
  const result = analyzeIssuePreparation([
    article({ id: "a", volume: " 1 ", issue: " 2 " }),
    article({ id: "b", volume: "1", issue: "2" }),
    article({ id: "c", volume: "1", issue: "3" }),
  ]);
  assert.equal(result.groups.length, 2);
  assert.deepEqual(result.groups.map(item => [item.volume, item.number]), [["1","2"], ["1","3"]]);
  assert.equal(result.groups[0].drafts.length, 2);
});

test("the editor query limit is explicitly flagged as potentially incomplete", () => {
  const many = Array.from({ length: 300 }, (_, n) => article({ id: String(n) }));
  assert.equal(analyzeIssuePreparation(many).possiblyTruncated, true);
  assert.equal(analyzeIssuePreparation(many.slice(0,299)).possiblyTruncated, false);
});

test("group keys do not collide on punctuation inside valid metadata", () => {
  const result = analyzeIssuePreparation([
    article({ id: "a", volume: "1,2", issue: "3" }),
    article({ id: "b", volume: "1", issue: "2,3" }),
  ]);
  assert.equal(result.groups.length, 2);
});

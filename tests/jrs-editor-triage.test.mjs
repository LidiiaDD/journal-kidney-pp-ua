import test from "node:test";
import assert from "node:assert/strict";
import { analyzeEditorialTriage } from "../app/lib/jrs-editor-triage.ts";

function manuscript(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "local-test-only",
    title: "Research metadata for a local test",
    abstract: "Methodological background and findings that are never published.",
    type: "review",
    language: "uk",
    authors: [{ name: "Test Author" }],
    keywords: ["Kidney research"],
    review_kind: "editorial",
    status: "draft",
    updated_at: "2026-10-26T12:00:00Z",
    published_at: null,
    pdf_path: null,
    ...overrides,
  };
}

test("empty editor list has no fabricated submissions, statistics or approval", () => {
  const result = analyzeEditorialTriage([]);
  assert.deepEqual(result.drafts, []);
  assert.equal(result.publishedCount, 0);
  assert.equal(result.draftsNeedingMetadata, 0);
  assert.equal(result.draftsWithoutTechnicalBlockers, 0);
  assert.deepEqual(result.commonBlockers, []);
});

test("a complete draft is classified as technically unblocked, not published", () => {
  const result = analyzeEditorialTriage([manuscript()]);
  assert.equal(result.drafts.length, 1);
  assert.equal(result.publishedCount, 0);
  assert.equal(result.draftsNeedingMetadata, 0);
  assert.equal(result.draftsWithoutTechnicalBlockers, 1);
  assert.deepEqual(result.drafts[0].blockers, []);
});

test("draft without a recorded review is counted as a technical problem", () => {
  const result = analyzeEditorialTriage([manuscript({ review_kind: null })]);
  assert.equal(result.draftsNeedingMetadata, 1);
  assert.equal(result.draftsWithoutTechnicalBlockers, 0);
  assert.equal(result.drafts[0].blockers[0].code, "review");
  assert.deepEqual(result.commonBlockers.map(item => item.count), [1]);
});

test("common blockers count affected drafts, not arbitrary appearances", () => {
  const result = analyzeEditorialTriage([
    manuscript({ id: "a", review_kind: null, title: "A" }),
    manuscript({ id: "b", review_kind: null }),
    manuscript({ id: "c", title: "A" }),
  ]);
  assert.equal(result.draftsNeedingMetadata, 3);
  assert.equal(result.commonBlockers.find(item => item.code === "review").count, 2);
  assert.equal(result.commonBlockers.find(item => item.code === "title").count, 2);
});

test("published rows are counted but never audited as editable drafts", () => {
  const result = analyzeEditorialTriage([
    manuscript({ id: "published", status: "published", review_kind: null }),
    manuscript({ id: "draft" }),
  ]);
  assert.equal(result.publishedCount, 1);
  assert.equal(result.drafts.length, 1);
  assert.equal(result.drafts[0].article.id, "draft");
  assert.equal(result.draftsNeedingMetadata, 0);
});

test("submitted order stays stable for editor rows", () => {
  const result = analyzeEditorialTriage([
    manuscript({ id: "new" }),
    manuscript({ id: "old", review_kind: null }),
  ]);
  assert.deepEqual(result.drafts.map(item => item.article.id), ["new", "old"]);
});

test("a 300-row server limit prompts an honest incompleteness warning", () => {
  const rows = Array.from({ length: 300 }, (_, i) => manuscript({ id: String(i) }));
  assert.equal(analyzeEditorialTriage(rows).possiblyIncomplete, true);
  assert.equal(analyzeEditorialTriage(rows.slice(0, 299)).possiblyIncomplete, false);
});

test("unknown statuses never silently appear in published totals", () => {
  const result = analyzeEditorialTriage([
    manuscript({ id: "unknown", status: "under-review" }),
    manuscript({ id: "published", status: "published" }),
  ]);
  assert.equal(result.drafts.length, 0);
  assert.equal(result.publishedCount, 1);
});

test("a missing PDF or issue does not automatically create a technical blocker", () => {
  const result = analyzeEditorialTriage([
    manuscript({ volume: null, issue: null, pdf_path: null }),
  ]);
  assert.equal(result.draftsWithoutTechnicalBlockers, 1);
});

test("published article with invalid metadata is never declared a draft needing repair", () => {
  const result = analyzeEditorialTriage([
    manuscript({ status: "published", title: "", authors: [] }),
  ]);
  assert.equal(result.publishedCount, 1);
  assert.equal(result.draftsNeedingMetadata, 0);
  assert.deepEqual(result.drafts, []);
});

import test from "node:test";
import assert from "node:assert/strict";
import { publicationBlockers } from "../app/lib/jrs-publication-gate.ts";

function draft(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "renal-science-review",
    title: "Верифікований огляд досліджень нирок",
    abstract: "Мета, методи, висновки та обмеження дослідження в повному тексті.",
    type: "review",
    language: "uk",
    authors: [{ name: "Test Author" }],
    keywords: ["Хронічна хвороба нирок"],
    status: "draft",
    review_kind: "editorial",
    review_details: null,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    published_at: null,
    pdf_path: null,
    ...overrides,
  };
}

const codes = (article) => publicationBlockers(article).map(item => item.code);

test("a saved draft with valid basics has zero technical blockers, not approval", () => {
  assert.deepEqual(codes(draft()), []);
});

test("published material can never be published again", () => {
  assert.ok(codes(draft({ status: "published" })).includes("status"));
});

test("review type must actually be selected", () => {
  assert.ok(codes(draft({ review_kind: null })).includes("review"));
  assert.ok(codes(draft({ review_kind: "unrecognized" })).includes("review"));
});

test("external review needs a substantial process description", () => {
  assert.ok(codes(draft({ review_kind: "external", review_details: "так" })).includes("review-details"));
  assert.ok(!codes(draft({ review_kind: "external", review_details: "Проведено незалежний розгляд двома фахівцями." })).includes("review-details"));
});

test("missing authors and keywords block publishing even when saved record is malformed", () => {
  const failures = codes(draft({ authors: [{ name: "" }], keywords: [] }));
  assert.ok(failures.includes("authors"));
  assert.ok(failures.includes("keywords"));
});

test("empty title and short abstract are rejected", () => {
  const failures = codes(draft({ title: "", abstract: "Коротко" }));
  assert.ok(failures.includes("title"));
  assert.ok(failures.includes("abstract"));
});

test("no translation is allowed; partial translation is not", () => {
  assert.ok(!codes(draft()).includes("translation"));
  assert.ok(codes(draft({ title_en: "Renal Medicine" })).includes("translation"));
  assert.ok(!codes(draft({
    title_en: "Renal Medicine",
    abstract_en: "Methods, results and interpretation of the kidney research.",
    keywords_en: ["Kidney Disease"]
  })).includes("translation"));
});

test("registered DOI is not inferred: only syntax is checked", () => {
  assert.ok(!codes(draft({ doi: null })).includes("doi"));
  assert.ok(!codes(draft({ doi: "10.5555/abc" })).includes("doi"));
  assert.ok(codes(draft({ doi: "fake" })).includes("doi"));
});

test("missing PDF and unassigned volume or issue do not invent a release", () => {
  const item = draft({ pdf_path: null, volume: null, issue: null });
  assert.deepEqual(codes(item), []);
});

test("malformed stored address and language are blocked", () => {
  const failures = codes(draft({ slug: "../../internal", language: "fr" }));
  assert.ok(failures.includes("slug"));
  assert.ok(failures.includes("language"));
});

test("the gate does not invent manual author, ethics, privacy or accuracy attestations", () => {
  const result = publicationBlockers(draft());
  assert.equal(result.length, 0);
  assert.ok(result.every(item => !["consent", "ethics", "privacy", "accuracy"].includes(item.code)));
});

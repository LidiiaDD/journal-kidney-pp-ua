import test from "node:test";
import assert from "node:assert/strict";
import { auditSavedArticle, hasValidOrcidCheckDigit } from "../app/lib/jrs-preflight.ts";

function draft(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "ckd-observation",
    title: "Верифіковане дослідження ХХН",
    abstract: "Мета, методи, результати й обмеження дослідження в науковому тексті.",
    language: "uk",
    type: "original-research",
    authors: [{ name: "Test Author", orcid: "0000-0002-1825-0097" }],
    keywords: ["нефрологія"],
    references_list: ["Верифіковане джерело"],
    status: "draft",
    published_at: null,
    pdf_path: null,
    review_kind: "editorial",
    review_details: null,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    ...overrides,
  };
}

function find(sections, id) {
  return sections.flatMap(section => section.items).find(check => check.id === id);
}

test("ORCID check digit is verified, not mistaken for registry identity", () => {
  assert.equal(hasValidOrcidCheckDigit("0000-0002-1825-0097"), true);
  assert.equal(hasValidOrcidCheckDigit("0000-0002-1825-0098"), false);
  assert.equal(hasValidOrcidCheckDigit("0000-0002-1825-009"), false);
});

test("complete base metadata does not imply ethical or author approval", () => {
  const sections = auditSavedArticle(draft());
  assert.equal(find(sections, "authors").status, "filled");
  assert.equal(find(sections, "review").status, "filled");
  assert.equal(find(sections, "ethics").status, "attention");
  assert.equal(find(sections, "pdf").status, "optional");
});

test("external review without a documented description needs attention", () => {
  const sections = auditSavedArticle(draft({ review_kind: "external", review_details: "ок" }));
  assert.equal(find(sections, "review").status, "attention");
});

test("incomplete translated metadata is flagged", () => {
  const sections = auditSavedArticle(draft({ title_en: "Renal observations" }));
  assert.equal(find(sections, "translation").status, "attention");
});

test("issue metadata require both volume and number to build an issue", () => {
  const sections = auditSavedArticle(draft({ volume: "1", issue: null }));
  assert.equal(find(sections, "issue").status, "attention");
  assert.equal(find(auditSavedArticle(draft({ volume: "1", issue: "1" })), "issue").status, "optional");
});

test("unknown declarations remain unidentified rather than being invented", () => {
  const sections = auditSavedArticle(draft({ funding_statement: "" }));
  assert.match(find(sections, "funding").detail, /Не зазначено/);
  assert.equal(find(sections, "funding").status, "attention");
});

test("DOI syntax is not described as proof of registration", () => {
  assert.equal(find(auditSavedArticle(draft({ doi: "10.1000/xyz" })), "doi").status, "optional");
  assert.match(find(auditSavedArticle(draft({ doi: "10.1000/xyz" })), "doi").detail, /реєстрацію/);
  assert.equal(find(auditSavedArticle(draft({ doi: "not-a-doi" })), "doi").status, "attention");
});

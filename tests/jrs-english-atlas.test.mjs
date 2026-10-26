import test from "node:test";
import assert from "node:assert/strict";
import {
  researchTopics, isTopicSlug, topicCounts, topicsForPublication,
} from "../app/lib/research-topics.ts";

const article = (slug, title, keywords = [], type = "original-research") => ({
  slug, title, keywords, type,
  publishedAt: "2026-10-26",
});

test("eight unique stable English atlas topics use the same catalogue slugs", () => {
  assert.equal(researchTopics.length, 8);
  assert.equal(new Set(researchTopics.map(topic => topic.slug)).size, 8);
  assert.deepEqual(researchTopics.map(topic => topic.code), ["01","02","03","04","05","06","07","08"]);
  assert.ok(researchTopics.every(topic => topic.english.trim().length > 5));
  for (const topic of researchTopics) assert.equal(isTopicSlug(topic.slug), true);
  for (const other of ["", "renal", "CKD", "transplantation", "../ckd", "other/"]) {
    assert.equal(isTopicSlug(other), false);
  }
});

test("no published papers means all live counters are zero, not invented", () => {
  const counts = topicCounts([]);
  assert.equal(Object.keys(counts).length, researchTopics.length);
  assert.ok(Object.values(counts).every(value => value === 0));
});

test("published metadata may match multiple fields without duplicating a field count", () => {
  const first = article("paper-1", "Chronic kidney disease and uromodulin", ["CKD", "biomarker"]);
  const second = article("paper-2", "Hemodialysis outcomes", ["dialysis"]);
  const counts = topicCounts([first, second]);
  assert.equal(counts.ckd, 1);
  assert.equal(counts.biomarkers, 1);
  assert.equal(counts.dialysis, 1);
  assert.equal(counts.other, 0);
  assert.deepEqual(new Set(topicsForPublication(first)), new Set(["ckd", "biomarkers"]));
});

test("a declared clinical case report is discoverable even without topic keywords", () => {
  const paper = article("case-1", "Unusual clinical presentation", [], "case-report");
  assert.ok(topicsForPublication(paper).includes("cases"));
});

test("unmatched published research remains visible in the further-research area", () => {
  const paper = article("misc-1", "Interdisciplinary study with unusual terminology", ["qualitative methods"]);
  assert.deepEqual(topicsForPublication(paper), ["other"]);
  assert.equal(topicCounts([paper]).other, 1);
});

test("English and Ukrainian declared keywords classify through one shared topic set", () => {
  const paper = {
    ...article("uk-1", "Дослідження", []),
    translations: { en: { title: "Renal ultrasound screening", keywords: ["imaging"] } },
  };
  assert.ok(topicsForPublication(paper).includes("imaging"));
});

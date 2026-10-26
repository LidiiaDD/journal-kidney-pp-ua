import test from "node:test";
import assert from "node:assert/strict";
import { englishArticleView } from "../app/lib/jrs-english-article.ts";

const article = {
  slug: "ckd-observation",
  title: "Клінічне спостереження",
  abstract: "Дослідження хронічної хвороби нирок.",
  keywords: ["ХХН"],
  language: "uk",
};

test("an untranslated Ukrainian publication is not silently translated", () => {
  const result = englishArticleView(article);
  assert.equal(result.metadata.title, article.title);
  assert.equal(result.language, "uk");
  assert.equal(result.englishAvailable, false);
  assert.equal(result.translated, false);
  assert.equal(result.indexable, false);
  assert.equal(result.canonical, "/publications/ckd-observation");
});

test("complete, approved English metadata is displayed without changing original", () => {
  const result = englishArticleView({
    ...article,
    translations: { en: {
      title: "Clinical observation",
      abstract: "An observation of chronic kidney disease.",
      keywords: ["CKD", "Nephrology"],
    } },
  });
  assert.equal(result.metadata.title, "Clinical observation");
  assert.equal(result.language, "en");
  assert.equal(result.translated, true);
  assert.equal(result.indexable, true);
  assert.equal(result.canonical, "/en/publications/ckd-observation");
  assert.equal(article.title, "Клінічне спостереження");
});

test("partial English metadata must never be presented as complete", () => {
  for (const metadata of [
    {title: "Partial", abstract: "", keywords: ["CKD"]},
    {title: "Partial", abstract: "Text", keywords: []},
    {title: " ", abstract: "Text", keywords: ["CKD"]},
  ]) {
    const result = englishArticleView({ ...article, translations: { en: metadata } });
    assert.equal(result.englishAvailable, false);
    assert.equal(result.indexable, false);
    assert.equal(result.metadata.title, article.title);
  }
});

test("an originally English article retains its actual language and primary canonical", () => {
  const result = englishArticleView({
    ...article, language: "en",
    title: "Kidney research", abstract: "Findings", keywords: ["CKD"],
  });
  assert.equal(result.englishAvailable, true);
  assert.equal(result.translated, false);
  assert.equal(result.language, "en");
  assert.equal(result.metadata.title, "Kidney research");
  assert.equal(result.canonical, "/publications/ckd-observation");
  assert.equal(result.indexable, false);
});

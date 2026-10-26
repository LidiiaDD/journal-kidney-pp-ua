import test from "node:test";
import assert from "node:assert/strict";
import {
  noticeLabelsEn, noticeDescriptionsEn,
  englishNoticeHref, englishNoticeDate, noticeSourceLanguageMessage,
} from "../app/lib/jrs-english-notices.ts";

test("all three decisions use distinct, truthful English labels", () => {
  assert.deepEqual(Object.keys(noticeLabelsEn).sort(), ["concern", "correction", "retraction"]);
  assert.equal(noticeLabelsEn.retraction, "Retraction");
  assert.equal(noticeLabelsEn.concern, "Expression of concern");
  assert.notEqual(noticeDescriptionsEn.correction, noticeDescriptionsEn.retraction);
  assert.match(noticeDescriptionsEn.concern, /not automatically imply/);
});

test("detail links are encoded and remain in the English namespace", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(englishNoticeHref(id), `/en/notices/${id}`);
  assert.equal(englishNoticeHref('a/"&<'), "/en/notices/a%2F%22%26%3C");
});

test("dates have a consistent English UTC display, independent of server timezone", () => {
  assert.equal(englishNoticeDate("2026-10-21T23:50:00Z"), "21 October 2026");
  assert.equal(englishNoticeDate("not-a-date"), "not-a-date");
});

test("English interface explicitly preserves source-language editorial wording", () => {
  assert.match(noticeSourceLanguageMessage, /reproduced verbatim/);
  assert.match(noticeSourceLanguageMessage, /no unapproved translation/);
});

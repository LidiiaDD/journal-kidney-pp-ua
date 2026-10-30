import test from "node:test";
import assert from "node:assert/strict";
import { prepareSubmissionMailto } from "../app/lib/jrs-mailto.ts";

const parse = (value) => new URL(value.href).searchParams;

test("short Ukrainian draft remains intact in the mail client", () => {
  const subject = "JRS — рукопис";
  const letter = "Шановна редакціє!\nКороткий текст.";
  const result = prepareSubmissionMailto(subject, letter, "fallback");
  assert.equal(result.shortened, false);
  assert.equal(parse(result).get("subject"), subject);
  assert.equal(parse(result).get("body"), letter);
});

test("long Cyrillic drafts use the compact mail body and encoded-safe subject", () => {
  const subject = "JRS — подання: " + "Д".repeat(220);
  const letter = "Дослідження ".repeat(80);
  assert.ok(letter.length < 1400);
  assert.ok(encodeURIComponent(letter).length > 1400);
  const fallback = "Короткий лист українською.";
  const result = prepareSubmissionMailto(subject, letter, fallback);
  const params = parse(result);
  assert.equal(result.shortened, true);
  assert.equal(params.get("body"), fallback);
  assert.ok(encodeURIComponent(params.get("subject")).length <= 480);
  assert.ok(encodeURIComponent(params.get("body")).length <= 1400);
});

test("truncation never splits a Unicode emoji into an invalid surrogate", () => {
  const subject = "a".repeat(478) + "💫";
  const result = prepareSubmissionMailto(subject, "ok", "short");
  assert.equal(parse(result).get("subject"), "a".repeat(478));
  assert.equal(result.shortened, true);
});

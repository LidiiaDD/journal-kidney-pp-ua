import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const guard = readFileSync(new URL("../app/admin/components/UnsavedDraftGuard.tsx", import.meta.url), "utf8");
const form = readFileSync(new URL("../app/admin/components/ArticleForm.tsx", import.meta.url), "utf8");

test("PDF form is explicitly connected to unsaved editor protection", () => {
  assert.match(form, /pdfUploadFormId=\{article \? "jrs-pdf-upload-form" : undefined\}/);
  assert.match(form, /<form id="jrs-pdf-upload-form" method="post"/);
  assert.match(guard, /pdfUploadFormId\?: string/);
  assert.match(guard, /document\.getElementById\(pdfUploadFormId\)/);
});

test("PDF POST and publish action are both intercepted during capture", () => {
  assert.match(guard, /const onPdfUpload = \(event: Event\) => blockExternalSubmit\(event, "pdf"\)/);
  assert.match(guard, /pdfUploadForm\.addEventListener\("submit", onPdfUpload, true\)/);
  assert.match(guard, /publishForm\.addEventListener\("submit", onPublish, true\)/);
});

test("dirty form blocks external submission before it can navigate", () => {
  assert.match(guard, /if \(!dirty\) return;[\s\S]*?event\.preventDefault\(\);[\s\S]*?event\.stopImmediatePropagation\(\);/);
  assert.match(guard, /setBlockedPdfUpload\(kind === "pdf"\)/);
  assert.match(guard, /setBlockedPublish\(kind === "publish"\)/);
});

test("blocked PDF upload tells editor to save then select PDF again", () => {
  assert.match(guard, /Завантаження PDF не розпочато/);
  assert.match(guard, /Спочатку збережіть чернетку, тоді повторно виберіть PDF/);
  assert.match(guard, /Вибраний файл не завантажувався/);
});

test("PDF and publication listeners are detached with component cleanup", () => {
  assert.match(guard, /pdfUploadForm\.removeEventListener\("submit", onPdfUpload, true\)/);
  assert.match(guard, /publishForm\.removeEventListener\("submit", onPublish, true\)/);
  assert.match(guard, /\[editorFormId, publishFormId, pdfUploadFormId\]/);
});

test("browser does not persist manuscript content and still warns on navigation", () => {
  assert.match(guard, /window\.addEventListener\("beforeunload", onUnload\)/);
  assert.match(guard, /editorForm\.addEventListener\("input", onEdit\)/);
  assert.doesNotMatch(guard, /\blocalStorage\.(setItem|getItem)\(|\bsessionStorage\.(setItem|getItem)\(/);
});

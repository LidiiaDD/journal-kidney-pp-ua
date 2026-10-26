import test from "node:test";
import assert from "node:assert/strict";
import { draftMetadataFilename, makeDraftMetadataExport } from "../app/lib/jrs-draft-export.ts";

const source = (overrides = {}) => ({
  id: "01234567-89ab-4cde-8123-456789abcdef",
  slug: "observational-renal-study",
  title: "Verified renal research",
  abstract: "A carefully prepared manuscript abstract",
  type: "original-research",
  language: "uk",
  authors: [{ name: "Research Author", affiliation: "Research Institute", orcid: "0000-0002-1825-0097" }],
  keywords: ["CKD", "renal outcomes"],
  references_list: ["Research journal: official article."],
  review_kind: "editorial",
  review_details: "Internal editorial check",
  ethics_statement: "Committee decision on file",
  funding_statement: "Funding disclosure",
  ai_disclosure: "Declared AI usage",
  pdf_path: "private-editor-id/private-storage-id.pdf",
  status: "draft",
  created_at: "2026-10-25T12:00:00Z",
  updated_at: "2026-10-26T19:00:00Z",
  published_at: null,
  published_by: "secret-editor-id",
  publication_checks: { authors: false, privacy: false, ethics: false, accuracy: false },
  private_token: "must-never-leave-the-server",
  ...overrides,
});
const instant = "2026-10-26T20:00:00.000Z";

test("allowlisted export records the metadata schema and snapshot time", () => {
  const backup = makeDraftMetadataExport(source(), instant);
  assert.equal(backup.format, "jrs-private-draft-metadata");
  assert.equal(backup.format_version, 1);
  assert.equal(backup.exported_at, instant);
  assert.equal(backup.source_updated_at, "2026-10-26T19:00:00Z");
  assert.equal(backup.record_status, "draft");
});

test("clinical manuscript fields and disclosures survive the export unchanged", () => {
  const entry = source();
  const backup = makeDraftMetadataExport(entry, instant);
  assert.deepEqual(backup.article.authors, entry.authors);
  assert.deepEqual(backup.article.keywords, entry.keywords);
  assert.deepEqual(backup.article.references_list, entry.references_list);
  assert.equal(backup.article.abstract, entry.abstract);
  assert.equal(backup.article.ethics_statement, entry.ethics_statement);
  assert.equal(backup.article.ai_disclosure, entry.ai_disclosure);
});

test("internal database identity, editor details and storage paths never escape", () => {
  const backup = makeDraftMetadataExport(source(), instant);
  const output = JSON.stringify(backup);
  for (const sensitive of ["01234567-89ab-4cde-8123-456789abcdef",
    "secret-editor-id", "private-editor-id/private-storage-id.pdf",
    "must-never-leave-the-server", "publication_checks", "published_by",
    "private_token"]) {
    assert.equal(output.includes(sensitive), false, sensitive);
  }
});

test("unexpected nested author fields are excluded from the archive", () => {
  const entry = source({
    authors: [{
      name: "Research Author",
      affiliation: "Research Institute",
      orcid: "0000-0002-1825-0097",
      private_notes: "sensitive editor-only author note",
      access_token: "do-not-copy-token",
    }],
  });
  const backup = makeDraftMetadataExport(entry, instant);
  assert.deepEqual(backup.article.authors, [{
    name: "Research Author",
    affiliation: "Research Institute",
    orcid: "0000-0002-1825-0097",
  }]);
  assert.equal(JSON.stringify(backup).includes("do-not-copy-token"), false);
});

test("attachment flag is truthful: PDF bytes are never included", () => {
  const withPdf = makeDraftMetadataExport(source(), instant);
  const withoutPdf = makeDraftMetadataExport(source({ pdf_path: null }), instant);
  assert.deepEqual(withPdf.attachment.pdf_present, true);
  assert.deepEqual(withPdf.attachment.pdf_included, false);
  assert.equal(withoutPdf.attachment.pdf_present, false);
});

test("published material is explicitly forbidden from draft archive helper", () => {
  assert.throws(() => makeDraftMetadataExport(source({ status: "published" }), instant), /Only private drafts/);
});

test("unknown or missing optional declarations are explicitly represented", () => {
  const backup = makeDraftMetadataExport(source({ doi: null, title_en: null }), instant);
  assert.equal(backup.article.title_en, null);
  assert.deepEqual(backup.article.keywords_en, []);
  assert.equal(backup.article.doi, null);
  assert.equal(backup.article.consent_statement, null);
});

test("the backup does not claim editorial approval or publication", () => {
  const backup = makeDraftMetadataExport(source(), instant);
  assert.equal(backup.record_status, "draft");
  assert.equal("publication_checks" in backup.article, false);
  assert.equal("published_at" in backup.article, false);
});

test("download names are deterministic and safe for header usage", () => {
  assert.equal(draftMetadataFilename("observational-renal-study", instant),
    "jrs-draft-observational-renal-study-2026-10-26.json");
  assert.equal(draftMetadataFilename("../../../danger\r\nheader", instant), "jrs-draft-manuscript-2026-10-26.json");
});

test("invalid timestamps cannot inject unsafe filename characters", () => {
  assert.equal(draftMetadataFilename("renal-study", "\r\nfoo: bar"), "jrs-draft-renal-study-undated.json");
});

test("JSON export is parseable and no local or remote side effects are needed", () => {
  const backup = makeDraftMetadataExport(source(), instant);
  const result = JSON.parse(JSON.stringify(backup));
  assert.equal(result.article.slug, "observational-renal-study");
  assert.equal(result.attachment.pdf_included, false);
});

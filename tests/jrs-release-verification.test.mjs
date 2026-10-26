import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { jrsReleaseInfo } from "../app/lib/jrs-release-info.ts";

const SHA = "a".repeat(40);

test("release identity uses only the Vercel Git SHA and environment", () => {
  assert.deepEqual(jrsReleaseInfo({
    VERCEL_ENV: "production",
    VERCEL_GIT_COMMIT_SHA: SHA,
    JRS_SUPABASE_URL: "https://private.supabase.co",
    JRS_SUPABASE_PUBLISHABLE_KEY: "secret",
  }), {
    service: "journal-of-renal-science",
    environment: "production",
    commit: SHA,
  });
});

test("a missing SHA is never replaced by a guessed or previous SHA", () => {
  assert.equal(jrsReleaseInfo({ VERCEL_ENV: "production" }).commit, null);
  assert.equal(jrsReleaseInfo({ VERCEL_GIT_COMMIT_SHA: "" }).commit, null);
});

test("invalid, uppercase, shortened and injected SHAs are never reflected", () => {
  for (const commit of ["abcd", "A".repeat(40), "b".repeat(39), SHA + "\r\nheader: injected"]) {
    assert.equal(jrsReleaseInfo({ VERCEL_GIT_COMMIT_SHA: commit }).commit, null);
  }
});

test("nonstandard and hostile deployment environment names are omitted", () => {
  assert.equal(jrsReleaseInfo({ VERCEL_ENV: "production-secret-token" }).environment, "unknown");
  assert.equal(jrsReleaseInfo({ VERCEL_ENV: "<script>alert(1)</script>" }).environment, "unknown");
  assert.equal(jrsReleaseInfo({ VERCEL_ENV: "preview" }).environment, "preview");
  assert.equal(jrsReleaseInfo({ VERCEL_ENV: "development" }).environment, "development");
});

test("the helper is read-only and does not mutate the environment", () => {
  const environment = Object.freeze({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: SHA });
  assert.equal(jrsReleaseInfo(environment).commit, SHA);
  assert.deepEqual(environment, { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: SHA });
});

test("release response is explicitly non-cacheable and not indexable", () => {
  const file = readFileSync(new URL("../app/api/release/route.ts", import.meta.url), "utf8");
  assert.match(file, /"Cache-Control": "public, no-store, max-age=0"/);
  assert.match(file, /"X-Robots-Tag": "noindex, nofollow"/);
  assert.match(file, /jrsReleaseInfo\(process\.env\)/);
  assert.doesNotMatch(file, /getEditorArticle|JRS_SUPABASE_PUBLISHABLE_KEY|cookies\(/);
});

test("live checker validates public site and private editor routes separately", () => {
  const file = readFileSync(new URL("../scripts/verify-jrs-live.mjs", import.meta.url), "utf8");
  assert.match(file, /https:\/\/journal\.kidney\.pp\.ua/);
  assert.match(file, /\/api\/release/);
  assert.match(file, /\/en\/notices/);
  assert.match(file, /\/admin\/articles\/\$\{dummyId\}\/export/);
  assert.match(file, /\/admin\/articles\/\$\{dummyId\}\/pdf/);
  assert.match(file, /release\?\.commit === expectedSha/);
  assert.match(file, /redirect: "manual"/);
});

test("manual workflow never runs on every push or deploys automatically", () => {
  const file = readFileSync(new URL("../.github/workflows/verify-live.yml", import.meta.url), "utf8");
  assert.match(file, /workflow_dispatch:/);
  assert.match(file, /expected_sha:/);
  assert.match(file, /permissions:\s+contents: read/);
  assert.doesNotMatch(file, /^\s*push:/m);
  assert.doesNotMatch(file, /^\s*schedule:/m);
  assert.doesNotMatch(file, /vercel deploy|supabase|deploy --prod|npm publish/);
});

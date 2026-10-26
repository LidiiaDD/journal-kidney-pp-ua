#!/usr/bin/env node
/**
 * Read-only verification of the LIVE JRS deployment.
 * Never send credentials, request bodies, manuscript content, or tokens.
 *
 * Run only after a production deployment:
 *   node scripts/verify-jrs-live.mjs <EXPECTED_40_CHAR_COMMIT_SHA>
 */
const expectedSha = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(expectedSha || "")) {
  process.stderr.write("Expected a lowercase, full 40-character Git commit SHA.\n");
  process.exit(2);
}

const origin = "https://journal.kidney.pp.ua";
let failures = 0;

async function request(path) {
  return fetch(new URL(path, origin), {
    method: "GET",
    redirect: "manual",
    cache: "no-store",
    headers: { "Accept": "application/json, text/html;q=0.8, */*;q=0.5" },
    signal: AbortSignal.timeout(15000),
  });
}

function check(name, valid, detail) {
  process.stdout.write(`${valid ? "PASS" : "FAIL"} ${name}${valid || !detail ? "" : ` — ${detail}`}\n`);
  if (!valid) failures++;
}

try {
  const response = await request("/api/release");
  check("public release endpoint responds 200", response.status === 200, `HTTP ${response.status}`);
  const cacheControl = response.headers.get("cache-control") || "";
  check("release endpoint is not cached", /no-store/i.test(cacheControl));
  const release = response.ok ? await response.json().catch(() => null) : null;
  check("release reports JRS, not an unrelated service",
    release?.service === "journal-of-renal-science");
  check("release is running in production", release?.environment === "production");
  check("production commit matches tested GitHub SHA", release?.commit === expectedSha,
    release?.commit ? "unexpected commit (see deployment settings)" : "commit unavailable");
} catch (error) {
  check("release route reachable", false, error instanceof Error ? error.message : "network failure");
}

for (const path of ["/", "/publications", "/notices", "/en", "/en/publications", "/en/notices", "/sitemap.xml", "/robots.txt"]) {
  try {
    const response = await request(path);
    check(`public ${path}`, response.status === 200, `HTTP ${response.status}`);
    if (response.ok && path === "/robots.txt") {
      const body = await response.text();
      check("robots declares production sitemap",
        /^Sitemap:\s*https:\/\/journal\.kidney\.pp\.ua\/sitemap\.xml\s*$/im.test(body));
      check("robots excludes editor cabinet crawlers",
        /^Disallow:\s*\/admin\s*$/im.test(body));
    } else if (response.ok && path === "/sitemap.xml") {
      const body = await response.text();
      check("sitemap is a real URL collection", /<urlset[\s>]/i.test(body));
      check("sitemap excludes private editor routes", !body.includes("/admin"));
    } else {
      await response.body?.cancel();
    }
  } catch (error) {
    check(`public ${path}`, false, error instanceof Error ? error.message : "network failure");
  }
}

const dummyId = "11111111-1111-4111-8111-111111111111";
for (const path of ["/admin", `/admin/articles/${dummyId}`, `/admin/articles/${dummyId}/export`, `/admin/articles/${dummyId}/pdf`]) {
  try {
    const response = await request(path);
    const location = response.headers.get("location");
    const redirectToLogin = response.status >= 300 && response.status < 400 &&
      Boolean(location) && new URL(location, origin).pathname === "/admin/login";
    const denied = response.status === 401 || response.status === 403 ||
      (path !== "/admin" && response.status === 404);
    check(`anonymous access denied ${path}`, redirectToLogin || denied,
      `HTTP ${response.status}`);
    await response.body?.cancel();
  } catch (error) {
    check(`anonymous access denied ${path}`, false,
      error instanceof Error ? error.message : "network failure");
  }
}

if (failures) {
  process.stderr.write(`JRS live verification failed ${failures} check(s). No changes were made.\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("JRS production identity and public/private route smoke checks passed.\n");
}

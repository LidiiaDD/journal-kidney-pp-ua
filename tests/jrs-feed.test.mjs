import test from "node:test";
import assert from "node:assert/strict";
import { buildJrsRss, escapeRssText } from "../app/lib/jrs-feed.ts";

const article = {
  slug: "ckd-safe-article",
  title: 'ХХН & <клініка> "2026"',
  publishedAt: "2026-10-20",
  type: "original-research",
  language: "uk",
  authors: [{ name: "Test Author" }],
  abstract: "Висновки & таблиці < перевірені.",
  keywords: ["ХХН"],
};

const correction = {
  id: "11111111-1111-4111-8111-111111111111",
  article_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  kind: "correction",
  title: "Уточнення & примітка",
  explanation: "Виправлено підпис до таблиці.",
  issued_at: "2026-10-21T12:00:00Z",
  jrs_articles: { slug: article.slug, title: article.title, authors: article.authors },
};

test("escapes XML metacharacters and invalid control characters", () => {
  assert.equal(escapeRssText('a & <b> "c" \u0001'), "a &amp; &lt;b&gt; &quot;c&quot; ");
});

test("empty archive yields a valid channel with no invented publications", () => {
  const rss = buildJrsRss([], []);
  assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(rss, /<channel>/);
  assert.doesNotMatch(rss, /<item>/);
  assert.doesNotMatch(rss, /<lastBuildDate>/);
});

test("publishes escaped real public articles with a stable permalink GUID", () => {
  const rss = buildJrsRss([article], []);
  assert.match(rss, /<title>ХХН &amp; &lt;клініка&gt; &quot;2026&quot;<\/title>/);
  assert.match(rss, /<description>Висновки &amp; таблиці &lt; перевірені\.<\/description>/);
  assert.match(rss, /<guid isPermaLink="true">https:\/\/journal\.kidney\.pp\.ua\/publications\/ckd-safe-article<\/guid>/);
  assert.match(rss, /<pubDate>Tue, 20 Oct 2026 00:00:00 GMT<\/pubDate>/);
});

test("editorial notices appear separately and newer than their parent article", () => {
  const rss = buildJrsRss([article], [correction]);
  assert.equal((rss.match(/<item>/g) || []).length, 2);
  assert.ok(rss.indexOf("/notices/") < rss.indexOf("/publications/ckd-safe-article"));
  assert.match(rss, /<category>Виправлення<\/category>/);
  assert.match(rss, /<lastBuildDate>Wed, 21 Oct 2026 12:00:00 GMT<\/lastBuildDate>/);
});

test("invalid calendar dates are not invented in feed items", () => {
  const rss = buildJrsRss([{ ...article, publishedAt: "2026-02-30" }], []);
  assert.equal((rss.match(/<pubDate>/g) || []).length, 0);
});

test("feed is bounded and never repeats its header as a fake item", () => {
  const articles = Array.from({ length: 123 }, (_, i) => ({
    ...article, slug: "renal-" + i, title: "Дослідження " + i,
  }));
  const rss = buildJrsRss(articles, []);
  assert.equal((rss.match(/<item>/g) || []).length, 100);
  assert.equal((rss.match(/<channel>/g) || []).length, 1);
});

test("URL paths stay encoded instead of permitting injected XML", () => {
  const rss = buildJrsRss([{ ...article, slug: 'test"&<slug' }], []);
  assert.match(rss, /\/publications\/test%22%26%3Cslug/);
  assert.doesNotMatch(rss, /<slug/);
});

test("article-only feed excludes notices and advertises its own self URL", () => {
  const rss = buildJrsRss([article], [correction], "articles");
  assert.equal((rss.match(/<item>/g) || []).length, 1);
  assert.match(rss, /<link>https:\/\/journal\.kidney\.pp\.ua\/publications\/ckd-safe-article<\/link>/);
  assert.doesNotMatch(rss, /<category>Виправлення<\/category>/);
  assert.match(rss, /https:\/\/journal\.kidney\.pp\.ua\/feeds\/articles\.xml/);
});

test("editorial-notice feed excludes articles and includes only real notices", () => {
  const rss = buildJrsRss([article], [correction], "notices");
  assert.equal((rss.match(/<item>/g) || []).length, 1);
  assert.match(rss, /<category>Виправлення<\/category>/);
  assert.doesNotMatch(rss, /<category>Наукова публікація<\/category>/);
  assert.match(rss, /https:\/\/journal\.kidney\.pp\.ua\/feeds\/notices\.xml/);
});

test("each specialist channel is valid when its type has no published records", () => {
  const articles = buildJrsRss([], [correction], "articles");
  const notices = buildJrsRss([article], [], "notices");
  assert.match(articles, /<channel>/);
  assert.match(notices, /<channel>/);
  assert.doesNotMatch(articles, /<item>/);
  assert.doesNotMatch(notices, /<item>/);
});


test("RSS copy handles successful, blocked and unavailable Clipboard APIs", async () => {
  const { tryCopyFeedAddress } = await import("../app/lib/jrs-feed-copy.ts");
  const url = "https://journal.kidney.pp.ua/feeds/articles.xml";
  let received = "";
  assert.equal(await tryCopyFeedAddress(url, { writeText: async value => { received = value; } }), true);
  assert.equal(received, url);
  assert.equal(await tryCopyFeedAddress(url, { writeText: async () => { throw new Error("NotAllowedError"); } }), false);
  assert.equal(await tryCopyFeedAddress(url, undefined), false);
});

test("RSS copy failure reveals a selectable, labelled read-only address", async () => {
  const { readFileSync } = await import("node:fs");
  const component = readFileSync(new URL("../app/components/FeedCopyButton.tsx", import.meta.url), "utf8");
  assert.match(component, /setManualCopy\(!copied\)/);
  assert.match(component, /\{manualCopy && \(/);
  assert.match(component, /readOnly/);
  assert.match(component, /value=\{url\}/);
  assert.match(component, /aria-label="RSS-адреса для ручного копіювання"/);
  assert.match(component, /currentTarget\.select\(\)/);
});

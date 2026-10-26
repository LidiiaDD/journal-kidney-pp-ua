import type { Publication } from "./publications";
import type { NoticeWithArticle } from "./jrs-notices";

const ORIGIN = "https://journal.kidney.pp.ua";
const MAX_ITEMS = 100;

type FeedEntry = {
  title: string;
  description: string;
  permalink: string;
  category: string;
  publishedAt: Date | null;
};

const noticeCategories: Record<NoticeWithArticle["kind"], string> = {
  correction: "Виправлення",
  concern: "Повідомлення про занепокоєння",
  retraction: "Відкликання",
};

/** XML 1.0 character safety; escape text, never interpolate raw metadata in markup. */
export function escapeRssText(value: string): string {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Article dates are calendar dates, not precise publication timestamps. */
function parseArticleDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date : null;
}

function parseNoticeTimestamp(value: string): Date | null {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function itemXml(item: FeedEntry): string {
  return [
    "    <item>",
    "      <title>" + escapeRssText(item.title) + "</title>",
    "      <link>" + escapeRssText(item.permalink) + "</link>",
    "      <guid isPermaLink=\"true\">" + escapeRssText(item.permalink) + "</guid>",
    "      <description>" + escapeRssText(item.description) + "</description>",
    "      <category>" + escapeRssText(item.category) + "</category>",
    ...(item.publishedAt
      ? ["      <pubDate>" + item.publishedAt.toUTCString() + "</pubDate>"]
      : []),
    "    </item>",
  ].join("\n");
}

/**
 * Public discovery ONLY. Input collections must already be public/RLS-filtered.
 * Notices and articles are distinct, stable permalink items, newest first.
 */
export function buildJrsRss(
  articles: readonly Publication[],
  notices: readonly NoticeWithArticle[]
): string {
  const articleEntries: FeedEntry[] = articles.map(article => ({
    title: article.title,
    description: article.abstract,
    permalink: ORIGIN + "/publications/" + encodeURIComponent(article.slug),
    category: "Наукова публікація",
    publishedAt: parseArticleDate(article.publishedAt),
  }));

  const noticeEntries: FeedEntry[] = notices.map(notice => ({
    title: noticeCategories[notice.kind] + ": " + notice.title,
    description: notice.explanation +
      " Стаття: " + notice.jrs_articles.title + ".",
    permalink: ORIGIN + "/notices/" + encodeURIComponent(notice.id),
    category: noticeCategories[notice.kind],
    publishedAt: parseNoticeTimestamp(notice.issued_at),
  }));

  const entries = [...articleEntries, ...noticeEntries]
    .sort((a, b) =>
      (b.publishedAt?.getTime() ?? -1) - (a.publishedAt?.getTime() ?? -1) ||
      a.permalink.localeCompare(b.permalink))
    .slice(0, MAX_ITEMS);

  const lastDate = entries.find(entry => entry.publishedAt)?.publishedAt;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Journal of Renal Science — наукові публікації та редакційні повідомлення</title>",
    "    <link>" + ORIGIN + "</link>",
    "    <description>Оприлюднені дослідження, виправлення та відкликання Journal of Renal Science. Чернетки не публікуються.</description>",
    "    <language>uk-UA</language>",
    '    <atom:link href="' + ORIGIN + '/feed.xml" rel="self" type="application/rss+xml" />',
    ...(lastDate ? ["    <lastBuildDate>" + lastDate.toUTCString() + "</lastBuildDate>"] : []),
    ...entries.map(itemXml),
    "  </channel>",
    "</rss>",
  ].join("\n");
}

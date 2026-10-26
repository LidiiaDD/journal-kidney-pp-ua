import "server-only";
import type { Publication } from "./publications";

export type JrsIssue = {
  key: string;
  volume: string;
  number: string;
  articles: Publication[];
  /** Most recent article publication date, not the issue release date. */
  latestArticleDate: string;
};

const MAX_PART = 50;

export function makeIssueKey(volume: string, number: string): string {
  return Buffer.from(JSON.stringify([volume.trim(), number.trim()]), "utf8")
    .toString("base64url");
}

export function parseIssueKey(key: string): { volume: string; number: string } | null {
  if (!/^[A-Za-z0-9_-]{4,280}$/.test(key)) return null;
  try {
    const decoded = Buffer.from(key, "base64url").toString("utf8");
    const pair: unknown = JSON.parse(decoded);
    if (!Array.isArray(pair) || pair.length !== 2
      || typeof pair[0] !== "string" || typeof pair[1] !== "string"
      || !pair[0].trim() || !pair[1].trim()
      || pair[0].length > MAX_PART || pair[1].length > MAX_PART) return null;
    // Only canonical URLs; avoid alternative keys for the same issue.
    if (makeIssueKey(pair[0], pair[1]) !== key) return null;
    return { volume: pair[0], number: pair[1] };
  } catch {
    return null;
  }
}

export function issueHref(key: string): string {
  return `/issues/${key}`;
}

/** Groups ONLY released articles with both volume and issue metadata. */
export function groupPublishedIssues(articles: readonly Publication[]): JrsIssue[] {
  const grouped = new Map<string, JrsIssue>();

  for (const article of articles) {
    const volume = article.volume?.trim();
    const number = article.issue?.trim();
    if (!volume || !number || volume.length > MAX_PART || number.length > MAX_PART) continue;

    const key = makeIssueKey(volume, number);
    let group = grouped.get(key);
    if (!group) {
      group = { key, volume, number, latestArticleDate: article.publishedAt, articles: [] };
      grouped.set(key, group);
    }
    group.articles.push(article);
    if (article.publishedAt > group.latestArticleDate) group.latestArticleDate = article.publishedAt;
  }

  const issues = [...grouped.values()];
  for (const issue of issues) {
    issue.articles.sort((a, b) =>
      a.publishedAt.localeCompare(b.publishedAt) || a.title.localeCompare(b.title, "uk"));
  }
  return issues.sort((a, b) =>
    b.latestArticleDate.localeCompare(a.latestArticleDate)
    || b.volume.localeCompare(a.volume, "uk", { numeric: true })
    || b.number.localeCompare(a.number, "uk", { numeric: true }));
}

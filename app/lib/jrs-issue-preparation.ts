import type { ArticleRow } from "./jrs-supabase";

export type IssueGroup = {
  key: string;
  volume: string;
  number: string;
  drafts: ArticleRow[];
  published: ArticleRow[];
};

export type IssuePreparation = {
  groups: IssueGroup[];
  unassignedDrafts: ArticleRow[];
  unassignedPublished: ArticleRow[];
  partialDrafts: ArticleRow[];
  partialPublished: ArticleRow[];
  invalidDrafts: ArticleRow[];
  invalidPublished: ArticleRow[];
  totalDrafts: number;
  totalPublished: number;
  /** The editor REST query is limited; this may not be a complete archive. */
  possiblyTruncated: boolean;
};

const MAX_PART_LENGTH = 50;

type Allocation = "assigned" | "unassigned" | "partial" | "invalid";

function classify(article: ArticleRow): {
  allocation: Allocation;
  volume: string;
  number: string;
} {
  const volume = article.volume?.trim() || "";
  const number = article.issue?.trim() || "";
  if (volume.length > MAX_PART_LENGTH || number.length > MAX_PART_LENGTH) {
    return { allocation: "invalid", volume, number };
  }
  if (volume && number) return { allocation: "assigned", volume, number };
  if (volume || number) return { allocation: "partial", volume, number };
  return { allocation: "unassigned", volume, number };
}

/**
 * Private editorial planning only; this does not create or release an issue.
 * The PUBLIC archive groups published articles separately, using the same
 * nonempty and max-length volume/issue rules.
 */
export function analyzeIssuePreparation(articles: readonly ArticleRow[]): IssuePreparation {
  const groups = new Map<string, IssueGroup>();
  const result: IssuePreparation = {
    groups: [],
    unassignedDrafts: [], unassignedPublished: [],
    partialDrafts: [], partialPublished: [],
    invalidDrafts: [], invalidPublished: [],
    totalDrafts: 0, totalPublished: 0,
    possiblyTruncated: articles.length >= 300,
  };

  for (const article of articles) {
    const isPublished = article.status === "published";
    if (isPublished) result.totalPublished++;
    else if (article.status === "draft") result.totalDrafts++;
    else continue;

    const details = classify(article);
    const suffix = isPublished ? "Published" : "Drafts";
    if (details.allocation !== "assigned") {
      const category = details.allocation === "partial" ? "partial"
        : details.allocation === "invalid" ? "invalid" : "unassigned";
      const field = (category + suffix) as
        | "partialPublished" | "partialDrafts"
        | "invalidPublished" | "invalidDrafts"
        | "unassignedPublished" | "unassignedDrafts";
      result[field].push(article);
      continue;
    }

    const key = JSON.stringify([details.volume, details.number]);
    let group = groups.get(key);
    if (!group) {
      group = {
        key, volume: details.volume, number: details.number,
        drafts: [], published: [],
      };
      groups.set(key, group);
    }
    if (isPublished) group.published.push(article);
    else group.drafts.push(article);
  }

  for (const group of groups.values()) {
    group.drafts.sort((a, b) => a.title.localeCompare(b.title, "uk"));
    group.published.sort((a, b) =>
      (a.published_at || "").localeCompare(b.published_at || "") ||
      a.title.localeCompare(b.title, "uk"));
  }
  result.groups = [...groups.values()].sort((a, b) =>
    a.volume.localeCompare(b.volume, "uk", { numeric: true }) ||
    a.number.localeCompare(b.number, "uk", { numeric: true }));
  return result;
}

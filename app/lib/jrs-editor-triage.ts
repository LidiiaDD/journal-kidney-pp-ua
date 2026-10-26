import type { ArticleRow } from "./jrs-supabase";
import { publicationBlockers } from "./jrs-publication-gate.ts";
import type { PublicationBlocker } from "./jrs-publication-gate.ts";

export type EditorialDraftTriage = {
  article: ArticleRow;
  blockers: PublicationBlocker[];
};
export type EditorialTriage = {
  drafts: EditorialDraftTriage[];
  publishedCount: number;
  draftsNeedingMetadata: number;
  draftsWithoutTechnicalBlockers: number;
  /** Source query currently returns no more than 300 of the newest rows. */
  possiblyIncomplete: boolean;
  commonBlockers: { code: string; title: string; count: number }[];
};

/**
 * Read-only editorial overview of authorized, SAVED rows only.
 * This function neither verifies scientific claims nor approves publication.
 * Call it only after requireEditor/listEditorArticles: do not pass private
 * result objects to public routes, static pages or client-side components.
 */
export function analyzeEditorialTriage(articles: readonly ArticleRow[]): EditorialTriage {
  const drafts: EditorialDraftTriage[] = [];
  const counts = new Map<string, { code: string; title: string; count: number }>();
  let publishedCount = 0;
  let draftsNeedingMetadata = 0;
  let draftsWithoutTechnicalBlockers = 0;
  for (const article of articles) {
    if (article.status === "published") {
      publishedCount++;
      continue;
    }
    if (article.status !== "draft") continue;
    const blockers = publicationBlockers(article);
    drafts.push({ article, blockers });
    if (blockers.length) draftsNeedingMetadata++;
    else draftsWithoutTechnicalBlockers++;
    for (const blocker of blockers) {
      const previous = counts.get(blocker.code);
      if (previous) previous.count++;
      else counts.set(blocker.code, { code: blocker.code, title: blocker.title, count: 1 });
    }
  }

  return {
    drafts,
    publishedCount,
    draftsNeedingMetadata,
    draftsWithoutTechnicalBlockers,
    possiblyIncomplete: articles.length >= 300,
    commonBlockers: [...counts.values()]
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "uk")),
  };
}

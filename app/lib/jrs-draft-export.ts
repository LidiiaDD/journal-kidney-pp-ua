import type { ArticleRow } from "./jrs-supabase";

/**
 * Human-readable, metadata-only local draft export.
 *
 * Deliberately no editor ID, database ID, storage object path, publication
 * history, cookies, access token, or internal authorization data. There is no
 * automatic import, publishing action or off-site transmission here.
 */
export function makeDraftMetadataExport(article: ArticleRow, exportedAt: string) {
  if (article.status !== "draft") {
    throw new Error("Only private drafts can be exported");
  }

  return {
    format: "jrs-private-draft-metadata",
    format_version: 1,
    exported_at: exportedAt,
    source_updated_at: article.updated_at,
    record_status: "draft",
    attachment: {
      pdf_present: Boolean(article.pdf_path),
      pdf_included: false,
      note: "An attached PDF must be saved separately from the editor PDF link.",
    },
    article: {
      slug: article.slug,
      title: article.title,
      abstract: article.abstract,
      type: article.type,
      language: article.language,
      authors: article.authors,
      keywords: article.keywords,
      title_uk: article.title_uk ?? null,
      abstract_uk: article.abstract_uk ?? null,
      keywords_uk: article.keywords_uk ?? [],
      title_en: article.title_en ?? null,
      abstract_en: article.abstract_en ?? null,
      keywords_en: article.keywords_en ?? [],
      references_list: article.references_list ?? [],
      doi: article.doi ?? null,
      volume: article.volume ?? null,
      issue: article.issue ?? null,
      pages: article.pages ?? null,
      review_kind: article.review_kind ?? null,
      review_details: article.review_details ?? null,
      ethics_statement: article.ethics_statement ?? null,
      consent_statement: article.consent_statement ?? null,
      funding_statement: article.funding_statement ?? null,
      competing_interests: article.competing_interests ?? null,
      data_availability: article.data_availability ?? null,
      author_contributions: article.author_contributions ?? null,
      ai_disclosure: article.ai_disclosure ?? null,
    },
  };
}

/** Slug comes from the stored article and is never used as an unescaped path. */
export function draftMetadataFilename(slug: string, exportedAt: string): string {
  const safeSlug = /^[a-z0-9-]{3,100}$/.test(slug) ? slug : "manuscript";
  const day = /^\d{4}-\d{2}-\d{2}/.exec(exportedAt)?.[0] || "undated";
  return `jrs-draft-${safeSlug}-${day}.json`;
}

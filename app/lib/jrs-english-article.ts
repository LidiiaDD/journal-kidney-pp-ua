import type { Publication, TranslatedMetadata } from "./publications";

/** English display is based exclusively on original or editor-provided complete metadata. */
export type EnglishArticleView = {
  metadata: TranslatedMetadata;
  language: "en" | "uk";
  englishAvailable: boolean;
  translated: boolean;
  indexable: boolean;
  canonical: string;
};

export function englishArticleView(article: Publication): EnglishArticleView {
  const en = article.translations?.en;
  const translated = article.language !== "en"
    && Boolean(en?.title?.trim() && en?.abstract?.trim() && en.keywords?.length);
  const englishAvailable = article.language === "en" || translated;
  const metadata = translated && en ? en : {
    title: article.title,
    abstract: article.abstract,
    keywords: article.keywords,
  };
  const canonical = translated
    ? `/en/publications/${article.slug}`
    : `/publications/${article.slug}`;
  return {
    metadata,
    language: englishAvailable ? "en" : article.language,
    englishAvailable,
    translated,
    // Avoid indexing duplicate original-language metadata with a translated UI.
    indexable: translated,
    canonical,
  };
}

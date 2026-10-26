"use client";

import { useMemo, useState } from "react";
import type { Publication, PublicationType } from "@/app/lib/publications";

const types: { value: PublicationType | "all"; label: string }[] = [
  { value: "all", label: "All article types" },
  { value: "original-research", label: "Original research" },
  { value: "review", label: "Reviews" },
  { value: "case-report", label: "Case reports" },
  { value: "brief-report", label: "Brief communications" },
  { value: "perspective", label: "Perspectives" },
];
const labels: Record<PublicationType, string> = {
  "original-research": "Original research",
  review: "Review",
  "case-report": "Case report",
  "brief-report": "Brief communication",
  perspective: "Perspective",
};

export default function EnglishPublicationExplorer({ items }: { items: Publication[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [language, setLanguage] = useState<"all" | "en" | "uk">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return items.filter(item => {
      if (type !== "all" && item.type !== type) return false;
      const translated = item.translations?.en;
      const readableEnglish = item.language === "en" || Boolean(translated?.title);
      if (language === "en" && !readableEnglish) return false;
      if (language === "uk" && readableEnglish) return false;
      if (!normalized) return true;
      return [item.title, item.abstract, ...item.keywords,
        translated?.title || "", translated?.abstract || "", ...(translated?.keywords || []),
        ...item.authors.map(author => author.name)].join(" ").toLocaleLowerCase("en").includes(normalized);
    });
  }, [items, query, type, language]);

  return (
    <div className="jrs-en-explorer">
      <div className="jrs-en-explorer-tools">
        <label>Search title, author or keywords
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Try a research topic or surname…" />
        </label>
        <label>Article type
          <select value={type} onChange={event => setType(event.target.value as PublicationType | "all")}>
            {types.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>Language
          <select value={language} onChange={event => setLanguage(event.target.value as "all" | "en" | "uk")}>
            <option value="all">All published articles</option>
            <option value="en">English title available</option>
            <option value="uk">Original language only</option>
          </select>
        </label>
      </div>
      <div className="jrs-en-explorer-result">
        <span role="status" aria-live="polite">Showing {filtered.length} of {items.length} published articles</span>
        {(query || type !== "all" || language !== "all") &&
          <button type="button" onClick={() => { setQuery(""); setType("all"); setLanguage("all"); }}>Clear filters</button>}
      </div>
      {filtered.length ? (
        <div className="jrs-en-publication-list">
          {filtered.map((article, index) => {
            const translated = article.translations?.en;
            const hasEnglish = article.language === "en" || Boolean(translated?.title);
            const title = article.language === "en" ? article.title : translated?.title || article.title;
            const abstract = article.language === "en" ? article.abstract : translated?.abstract || article.abstract;
            const lang = hasEnglish ? "en" : article.language;
            const keywords = article.language === "en" ? article.keywords : translated?.keywords || article.keywords;
            return (
              <article className="jrs-en-publication-entry" key={article.slug}>
                <div className="jrs-en-publication-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="jrs-en-publication-details">
                  <div className="jrs-en-publication-meta">
                    <span>{labels[article.type]}</span>
                    <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                    <span>{hasEnglish ? "English metadata available" : "Original-language metadata"}</span>
                  </div>
                  <h2 lang={lang}><a href={`/publications/${article.slug}`}>{title}</a></h2>
                  <p className="jrs-en-publication-authors">{article.authors.map(a => a.name).join(", ")}</p>
                  <p lang={lang} className="jrs-en-publication-abstract">{abstract.length > 420 ? abstract.slice(0, 420).trimEnd() + "…" : abstract}</p>
                  {keywords.length > 0 && <div className="jrs-en-publication-tags">
                    {keywords.slice(0, 5).map(keyword => <span lang={lang} key={keyword}>{keyword}</span>)}
                  </div>}
                  <div className="jrs-en-publication-actions">
                    <a href={`/publications/${article.slug}`}>Read article ↗</a>
                    {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="jrs-en-explorer-empty">
          <span aria-hidden="true">✳</span>
          <h2>{items.length ? "No publications match these filters." : "The first scientific articles are in preparation."}</h2>
          <p>{items.length
            ? "Try a different topic, article type or language filter. No unpublished manuscripts are included."
            : "The catalogue currently contains no publicly released studies. Published research will appear here automatically, with English metadata only where it has actually been provided."}</p>
          {items.length ? <button type="button" onClick={() => { setQuery(""); setType("all"); setLanguage("all"); }}>Show all articles</button>
            : <a href="/en/authors">Explore author guidance ↗</a>}
        </div>
      )}
    </div>
  );
}

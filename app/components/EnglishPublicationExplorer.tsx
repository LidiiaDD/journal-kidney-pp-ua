"use client";

import { useMemo, useState } from "react";
import type { Publication, PublicationType } from "@/app/lib/publications";
import { englishArticleView } from "@/app/lib/jrs-english-article";
import { researchTopics, topicsForPublication, type TopicSlug } from "@/app/lib/research-topics";

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

export default function EnglishPublicationExplorer({
  items, initialTopic = "all",
}: { items: Publication[]; initialTopic?: TopicSlug | "all" }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [language, setLanguage] = useState<"all" | "en" | "uk">("all");
  const [topic, setTopic] = useState<TopicSlug | "all">(initialTopic);
  const activeTopic = researchTopics.find(item => item.slug === topic);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return items.filter(item => {
      if (type !== "all" && item.type !== type) return false;
      if (topic !== "all" && !topicsForPublication(item).includes(topic)) return false;
      const display = englishArticleView(item);
      if (language === "en" && !display.englishAvailable) return false;
      if (language === "uk" && display.englishAvailable) return false;
      if (!normalized) return true;
      return [item.title, item.abstract, ...item.keywords,
        display.metadata.title, display.metadata.abstract, ...display.metadata.keywords,
        ...item.authors.map(author => author.name)].join(" ").toLocaleLowerCase("en").includes(normalized);
    });
  }, [items, query, type, language, topic]);

  return (
    <div className="jrs-en-explorer">
      <div className="jrs-en-explorer-tools">
        <label>Search title, author or keywords
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Try a research topic or surname…" />
        </label>
        <label>Research area
          <select value={topic} onChange={event => setTopic(event.target.value as TopicSlug | "all")}>
            <option value="all">All research areas</option>
            {researchTopics.map(area => (
              <option key={area.slug} value={area.slug}>{area.english}</option>
            ))}
          </select>
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
            <option value="uk">No English metadata</option>
          </select>
        </label>
      </div>
      {activeTopic && (
        <div className="jrs-en-topic-selection">
          <span>RESEARCH ATLAS / {activeTopic.code}</span>
          <strong>{activeTopic.english}</strong>
          <a href="/en/topics">View all research fields ↗</a>
        </div>
      )}
      <div className="jrs-en-explorer-result">
        <span role="status" aria-live="polite">Showing {filtered.length} of {items.length} published articles</span>
        {(query || type !== "all" || language !== "all" || topic !== "all") &&
          <button type="button" onClick={() => { setQuery(""); setType("all"); setLanguage("all"); setTopic("all"); }}>Clear filters</button>}
      </div>
      {filtered.length ? (
        <div className="jrs-en-publication-list">
          {filtered.map((article, index) => {
            const display = englishArticleView(article);
            const { title, abstract, keywords } = display.metadata;
            const hasEnglish = display.englishAvailable;
            const lang = display.language;
            return (
              <article className="jrs-en-publication-entry" key={article.slug}>
                <div className="jrs-en-publication-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="jrs-en-publication-details">
                  <div className="jrs-en-publication-meta">
                    <span>{labels[article.type]}</span>
                    <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                    <span>{hasEnglish ? "English metadata available" : "Original-language metadata"}</span>
                  </div>
                  <h2 lang={lang}><a href={`/en/publications/${article.slug}`}>{title}</a></h2>
                  <p className="jrs-en-publication-authors">{article.authors.map(a => a.name).join(", ")}</p>
                  <p lang={lang} className="jrs-en-publication-abstract">{abstract.length > 420 ? abstract.slice(0, 420).trimEnd() + "…" : abstract}</p>
                  {keywords.length > 0 && <div className="jrs-en-publication-tags">
                    {keywords.slice(0, 5).map(keyword => <span lang={lang} key={keyword}>{keyword}</span>)}
                  </div>}
                  <div className="jrs-en-publication-actions">
                    <a href={`/en/publications/${article.slug}`}>Read article ↗</a>
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
          {items.length ? <button type="button" onClick={() => { setQuery(""); setType("all"); setLanguage("all"); setTopic("all"); }}>Show all articles</button>
            : <div className="jrs-en-explorer-empty-actions">
                <a href="/en/topics">Return to research atlas ↗</a>
                <a href="/en/authors">Explore author guidance ↗</a>
              </div>}
        </div>
      )}
    </div>
  );
}

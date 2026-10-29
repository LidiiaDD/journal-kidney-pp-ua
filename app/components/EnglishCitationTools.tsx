"use client";

import { useMemo, useState } from "react";
import type { Publication } from "@/app/lib/publications";
import {
  articleUrl, availableLanguages, formatCitation, toBibtex, toRis,
  type ArticleLanguage, type CitationStyle,
} from "@/app/lib/citations";

export default function EnglishCitationTools({ article }: { article: Publication }) {
  const langs = availableLanguages(article);
  const [style, setStyle] = useState<CitationStyle>("vancouver");
  const [language, setLanguage] = useState<ArticleLanguage>(langs.includes("en") ? "en" : article.language);
  const [message, setMessage] = useState("");
  const citation = useMemo(
    () => formatCitation(article, style, language),
    [article, style, language]
  );

  async function copy(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(success);
    } catch {
      setMessage("Clipboard access was denied. Please select and copy the text manually.");
    }
  }

  function download(extension: "ris" | "bib") {
    const source = extension === "ris" ? toRis(article, language) : toBibtex(article, language);
    const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `${article.slug}.${extension}`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    // Safari/mobile browsers may start a download asynchronously after click().
    // Match the Ukrainian citation widget's delayed cleanup.
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setMessage(extension === "ris" ? "RIS file prepared." : "BibTeX file prepared.");
  }

  return (
    <div className="jrs-en-citation-widget">
      <div className="jrs-en-citation-controls">
        <label>Citation style
          <select value={style} onChange={event => setStyle(event.target.value as CitationStyle)}>
            <option value="vancouver">Vancouver (simplified)</option>
            <option value="apa">APA (simplified)</option>
          </select>
        </label>
        {langs.length > 1 && <label>Title language
          <select value={language} onChange={event => setLanguage(event.target.value as ArticleLanguage)}>
            {langs.includes("en") && <option value="en">English</option>}
            {langs.includes("uk") && <option value="uk">Ukrainian</option>}
          </select>
        </label>}
      </div>
      <p className="jrs-en-citation-result">{citation}</p>
      <div className="jrs-en-citation-buttons">
        <button type="button" onClick={() => void copy(citation, "Citation copied.")}>Copy citation</button>
        <button type="button" onClick={() => void copy(articleUrl(article), "Article link copied.")}>Copy link</button>
        <button type="button" onClick={() => download("ris")}>Download RIS</button>
        <button type="button" onClick={() => download("bib")}>Download BibTeX</button>
      </div>
      <p className="jrs-en-citation-status" role="status" aria-live="polite">{message}</p>
      <p className="jrs-en-citation-footnote">Formats are simplified and generated from published metadata. Verify author conventions and punctuation before submitting a bibliography. DOI, volume, issue and page details are included only when actually recorded.</p>
    </div>
  );
}

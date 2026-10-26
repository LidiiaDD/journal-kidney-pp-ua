"use client";

import { useMemo, useState } from "react";
import type { Publication } from "@/app/lib/publications";
import {
  articleUrl, availableLanguages, formatCitation, toBibtex, toRis,
  type ArticleLanguage, type CitationStyle,
} from "@/app/lib/citations";

export default function CitationTools({ article }: { article: Publication }) {
  const [style, setStyle] = useState<CitationStyle>("vancouver");
  const [language, setLanguage] = useState<ArticleLanguage>(article.language);
  const [notice, setNotice] = useState("");
  const citation = useMemo(() => formatCitation(article, style, language), [article, style, language]);

  async function copy(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(success);
    } catch {
      setNotice("Копіювання не вдалося. Виділіть запис вручну.");
    }
  }

  function exportFile(extension: "ris" | "bib") {
    const content = extension === "ris" ? toRis(article, language) : toBibtex(article, language);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.slug}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice(extension === "ris" ? "Файл RIS підготовлено." : "Файл BibTeX підготовлено.");
  }

  const languages = availableLanguages(article);

  return (
    <div className="jrs-citation-tools">
      <div className="jrs-citation-controls">
        <label>Формат цитування
          <select value={style} onChange={event => setStyle(event.target.value as CitationStyle)}>
            <option value="vancouver">Vancouver (спрощений)</option>
            <option value="apa">APA (спрощений)</option>
          </select>
        </label>
        {languages.length > 1 && (
          <label>Мова назви
            <select value={language} onChange={event => setLanguage(event.target.value as ArticleLanguage)}>
              {languages.includes("uk") && <option value="uk">Українська</option>}
              {languages.includes("en") && <option value="en">English</option>}
            </select>
          </label>
        )}
      </div>
      <p className="pub-citation-example">{citation}</p>
      <div className="pub-citation-actions">
        <button type="button" onClick={() => void copy(citation, "Цитування скопійовано.")}>Копіювати цитування</button>
        <button type="button" onClick={() => void copy(articleUrl(article), "Посилання скопійовано.")}>Копіювати посилання</button>
        <button type="button" onClick={() => exportFile("ris")}>Експорт RIS</button>
        <button type="button" onClick={() => exportFile("bib")}>Експорт BibTeX</button>
        <span role="status" aria-live="polite">{notice}</span>
      </div>
      <p className="pub-source-note">
        Формати APA та Vancouver сформовано автоматично з перевірених редакцією полів.
        Остаточне оформлення варто звірити з вимогами видання, куди ви цитуєте.
        DOI й дані тому, випуску чи сторінок не створюються автоматично.
      </p>
    </div>
  );
}

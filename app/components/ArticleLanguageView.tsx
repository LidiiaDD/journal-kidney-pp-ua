"use client";

import { useState } from "react";
import type { Publication } from "@/app/lib/publications";
import { articleMetadata, availableLanguages } from "@/app/lib/citations";

export default function ArticleLanguageView({ article }: { article: Publication }) {
  const [language, setLanguage] = useState<"uk" | "en">(article.language);
  const langs = availableLanguages(article);
  const meta = articleMetadata(article, language);
  const isTranslation = article.language !== language;

  return (
    <div className="jrs-article-languages">
      {langs.length > 1 && (
        <div className="jrs-language-tabs">
          <strong>Метадані статті</strong>
          <div role="group" aria-label="Мова назви, анотації та ключових слів">
            <button type="button" aria-pressed={language === "uk"} onClick={() => setLanguage("uk")}>Українська</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
          </div>
        </div>
      )}
      <section id="abstract" lang={language}>
        {isTranslation && (
          <>
            <p className="jrs-translation-caption">Перевірений переклад метаданих · {language === "en" ? "English" : "Українська"}</p>
            <h2 className="jrs-alternate-title">{meta.title}</h2>
          </>
        )}
        <h2>{language === "en" ? "Abstract" : "Анотація"}</h2>
        <p className="pub-article-abstract">{meta.abstract}</p>
      </section>
      <section id="keywords" lang={language}>
        <h2>{language === "en" ? "Keywords" : "Ключові слова"}</h2>
        <div className="pub-keywords">
          {meta.keywords.map((keyword, index) => <span key={`${keyword}-${index}`}>{keyword}</span>)}
        </div>
      </section>
    </div>
  );
}

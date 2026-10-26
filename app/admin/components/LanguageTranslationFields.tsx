"use client";

import { useState } from "react";
import type { ArticleRow } from "@/app/lib/jrs-supabase";

type Lang = "uk" | "en";
type Values = { title: string; abstract: string; keywords: string };

type Props = { article?: ArticleRow };

export default function LanguageTranslationFields({ article }: Props) {
  const [language, setLanguage] = useState<Lang>(article?.language || "uk");
  const [values, setValues] = useState<Record<Lang, Values>>({
    uk: {
      title: article?.title_uk || "",
      abstract: article?.abstract_uk || "",
      keywords: article?.keywords_uk?.join(", ") || "",
    },
    en: {
      title: article?.title_en || "",
      abstract: article?.abstract_en || "",
      keywords: article?.keywords_en?.join(", ") || "",
    },
  });
  const other: Lang = language === "uk" ? "en" : "uk";
  const current = values[other];
  const update = (key: keyof Values, next: string) =>
    setValues(previous => ({
      ...previous,
      [other]: { ...previous[other], [key]: next },
    }));

  return (
    <>
      <label>Основна мова статті *
        <select name="language" value={language} onChange={event => setLanguage(event.target.value as Lang)}>
          <option value="uk">Українська</option>
          <option value="en">English</option>
        </select>
      </label>
      <div className="jrs-translation-block">
        <div className="jrs-translation-head">
          <h3>{other === "en" ? "English metadata" : "Українські метадані"}</h3>
          <span>Необов’язковий переклад</span>
        </div>
        <p>
          Введіть переклад назви, анотації та ключових слів іншою мовою.
          Якщо додаєте переклад — заповніть усі три поля. Переклад не створюється автоматично.
        </p>
        <label>{other === "en" ? "Title in English" : "Назва українською"}
          <input name={`title_${other}`} value={current.title} onChange={event => update("title", event.target.value)} maxLength={500}
            placeholder={other === "en" ? "Verified English article title" : "Перевірена українська назва"} />
        </label>
        <label>{other === "en" ? "Abstract in English" : "Анотація українською"}
          <textarea name={`abstract_${other}`} value={current.abstract} onChange={event => update("abstract", event.target.value)}
            rows={7} maxLength={15000} placeholder={other === "en" ? "Aim, methods, results, conclusions..." : "Мета, методи, результати, висновки..."} />
        </label>
        <label>{other === "en" ? "Keywords in English" : "Ключові слова українською"}
          <textarea name={`keywords_${other}`} value={current.keywords} onChange={event => update("keywords", event.target.value)}
            rows={2} placeholder={other === "en" ? "Chronic kidney disease, dialysis" : "Хронічна хвороба нирок, діаліз"} />
          <small>Розділяйте ключові слова комами або крапкою з комою.</small>
        </label>
      </div>
    </>
  );
}

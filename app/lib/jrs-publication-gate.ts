import type { ArticleRow } from "./jrs-supabase";

export type PublicationBlocker = {
  code: string;
  title: string;
  explanation: string;
};

const allowedTypes = new Set([
  "original-research", "review", "case-report", "brief-report", "perspective",
]);

/**
 * Shared, read-only server-side technical gate for publication.
 *
 * A zero-blocker result is NOT ethical approval, peer review, consent,
 * de-identification, scientific validation, or authorization to publish.
 * The four human attestations and RLS/database constraints stay mandatory.
 */
export function publicationBlockers(article: ArticleRow): PublicationBlocker[] {
  const items: PublicationBlocker[] = [];
  const add = (code: string, title: string, explanation: string) =>
    items.push({ code, title, explanation });

  if (article.status !== "draft") {
    add("status", "Статус матеріалу", "Редагувати або опублікувати можна тільки чернетку.");
  }
  if (!/^[a-z0-9-]{3,100}$/.test(article.slug || "")) {
    add("slug", "Постійна адреса", "Потрібна коректна унікальна адреса латиницею.");
  }
  if ((article.title?.trim().length ?? 0) < 5 || (article.title?.length ?? 0) > 500) {
    add("title", "Назва", "Назва повинна містити від 5 до 500 символів.");
  }
  if ((article.abstract?.trim().length ?? 0) < 20 || (article.abstract?.length ?? 0) > 15000) {
    add("abstract", "Анотація", "Анотація повинна містити від 20 до 15 000 символів.");
  }
  if (!allowedTypes.has(article.type)) {
    add("type", "Тип статті", "Необхідно вибрати підтримуваний тип наукового матеріалу.");
  }
  if (article.language !== "uk" && article.language !== "en") {
    add("language", "Основна мова", "Виберіть українську або англійську мову.");
  }
  if (!Array.isArray(article.authors) || article.authors.length === 0 ||
      article.authors.some(author => !author?.name?.trim())) {
    add("authors", "Автори", "Потрібно зазначити щонайменше одного автора з повним ім’ям.");
  }
  if (!Array.isArray(article.keywords) || !article.keywords.some(word => word?.trim())) {
    add("keywords", "Ключові слова", "Потрібно зазначити перевірені наукові ключові слова.");
  }
  if (article.review_kind !== "editorial" && article.review_kind !== "external") {
    add("review", "Фактичний тип розгляду", "Виберіть редакційний розгляд або документально проведене зовнішнє рецензування.");
  } else if (article.review_kind === "external" &&
      (article.review_details?.trim().length ?? 0) < 20) {
    add("review-details", "Опис зовнішнього рецензування", "Потрібен фактичний опис проведеного процесу щонайменше з 20 символів.");
  }

  const alt = article.language === "uk"
    ? [article.title_en, article.abstract_en, article.keywords_en]
    : [article.title_uk, article.abstract_uk, article.keywords_uk];
  const alternateHasContent = alt.some(value =>
    Array.isArray(value) ? value.some(word => Boolean(word?.trim())) : Boolean(value?.trim()));
  const alternateIsComplete =
    typeof alt[0] === "string" && alt[0].trim().length >= 5 &&
    typeof alt[1] === "string" && alt[1].trim().length >= 20 &&
    Array.isArray(alt[2]) && alt[2].some(word => Boolean(word?.trim()));
  if (alternateHasContent && !alternateIsComplete) {
    add("translation", "Переклад метаданих", "Якщо подаєте переклад, заповніть назву, анотацію та ключові слова разом.");
  }

  if (article.doi && !/^10[.]\d{4,9}\/\S+$/.test(article.doi.trim())) {
    add("doi", "DOI", "Формат DOI некоректний. Перевірка синтаксису не підтверджує реєстрацію DOI.");
  }

  return items;
}

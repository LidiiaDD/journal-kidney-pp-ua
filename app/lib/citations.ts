import type { Publication, TranslatedMetadata } from "./publications";

export type CitationStyle = "apa" | "vancouver";
export type ArticleLanguage = "uk" | "en";
const journal = "Journal of Renal Science";
const baseUrl = "https://journal.kidney.pp.ua/publications";

export function articleUrl(article: Publication): string {
  return `${baseUrl}/${article.slug}`;
}

export function availableLanguages(article: Publication): ArticleLanguage[] {
  const original = article.language;
  const other = original === "uk" ? "en" : "uk";
  const translation = article.translations?.[other];
  return translation?.title && translation?.abstract && translation.keywords.length
    ? [original, other] : [original];
}

export function articleMetadata(article: Publication, language: ArticleLanguage): TranslatedMetadata {
  if (language !== article.language) {
    const translated = article.translations?.[language];
    if (translated?.title && translated.abstract && translated.keywords.length) return translated;
  }
  return { title: article.title, abstract: article.abstract, keywords: article.keywords };
}

function clean(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

function articleYear(article: Publication): string {
  return article.publishedAt.slice(0, 4);
}

function imprint(article: Publication): string {
  if (!article.volume && !article.issue && !article.pages) return "";
  const volume = article.volume || "";
  const issue = article.issue ? `(${article.issue})` : "";
  const pages = article.pages ? `, ${article.pages}` : "";
  return `${volume}${issue}${pages}`.replace(/^, /, "");
}

export function formatCitation(article: Publication, style: CitationStyle, language: ArticleLanguage): string {
  const meta = articleMetadata(article, language);
  const authors = article.authors.map(a => clean(a.name)).join(", ");
  const url = article.doi ? `https://doi.org/${article.doi}` : articleUrl(article);
  const year = articleYear(article);
  if (style === "apa") {
    const issue = imprint(article);
    return `${authors} (${year}). ${clean(meta.title)}. ${journal}${issue ? `, ${issue}` : ""}. ${url}`;
  }
  const volume = article.volume || "";
  const issue = article.issue ? `(${article.issue})` : "";
  const pages = article.pages ? `:${article.pages}` : "";
  const locator = volume || issue || pages ? `;${volume}${issue}${pages}` : "";
  return `${authors}. ${clean(meta.title)}. ${journal}. ${year}${locator}. ${url}`;
}

function bibEscape(value: string): string {
  const escapes: Record<string, string> = {
    "\\": "\\textbackslash{}",
    "{": "\\{", "}": "\\}",
    "%": "\\%", "$": "\\$", "#": "\\#",
    "&": "\\&", "_": "\\_", "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  return value.replace(/[\\{}%$#&_~^]/g, char => escapes[char] || char);
}

export function toBibtex(article: Publication, language: ArticleLanguage): string {
  const meta = articleMetadata(article, language);
  const key = `jrs-${article.slug}-${articleYear(article)}`;
  const fields: [string, string][] = [
    ["author", article.authors.map(a => clean(a.name)).join(" and ")],
    ["title", clean(meta.title)],
    ["journal", journal],
    ["year", articleYear(article)],
    ["url", articleUrl(article)],
    ["language", language === "uk" ? "ukrainian" : "english"],
  ];
  if (article.volume) fields.push(["volume", article.volume]);
  if (article.issue) fields.push(["number", article.issue]);
  if (article.pages) fields.push(["pages", article.pages]);
  if (article.doi) fields.push(["doi", article.doi]);
  return `@article{${key},\n${fields.map(([k, v]) => `  ${k} = {${bibEscape(v)}}`).join(",\n")}\n}\n`;
}

export function toRis(article: Publication, language: ArticleLanguage): string {
  const meta = articleMetadata(article, language);
  const lines = [
    "TY  - JOUR",
    `TI  - ${clean(meta.title)}`,
    `JO  - ${journal}`,
    `PY  - ${articleYear(article)}`,
    `DA  - ${article.publishedAt.replace(/-/g, "/")}`,
    `LA  - ${language === "uk" ? "uk" : "en"}`,
    `UR  - ${articleUrl(article)}`,
    `AB  - ${clean(meta.abstract)}`,
    ...article.authors.map(author => `AU  - ${clean(author.name)}`),
    ...meta.keywords.map(keyword => `KW  - ${clean(keyword)}`),
  ];
  if (article.volume) lines.push(`VL  - ${article.volume}`);
  if (article.issue) lines.push(`IS  - ${article.issue}`);
  if (article.pages) {
    const [start, end] = article.pages.split(/\s*[-–]\s*/, 2);
    if (start) lines.push(`SP  - ${start}`);
    if (end) lines.push(`EP  - ${end}`);
  }
  if (article.doi) lines.push(`DO  - ${article.doi}`);
  lines.push("ER  - ", "");
  return lines.join("\n");
}

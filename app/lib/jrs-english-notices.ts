import type { NoticeKind } from "./jrs-notices";

export const noticeLabelsEn: Record<NoticeKind, string> = {
  correction: "Correction",
  concern: "Expression of concern",
  retraction: "Retraction",
};

export const noticeDescriptionsEn: Record<NoticeKind, string> = {
  correction: "A dated correction has been issued for this article. Consult the official explanation before citing the work.",
  concern: "The journal has issued an expression of concern. This does not automatically imply that an author committed misconduct or that the article has been retracted.",
  retraction: "This article has been retracted. Do not rely on its findings without considering the official retraction notice.",
};

export function englishNoticeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export function englishNoticeHref(id: string): string {
  return `/en/notices/${encodeURIComponent(id)}`;
}

export const noticeSourceLanguageMessage =
  "The official notice is reproduced verbatim. Its original language is preserved, and no unapproved translation has been created.";

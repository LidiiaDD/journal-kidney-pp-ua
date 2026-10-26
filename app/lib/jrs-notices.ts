import "server-only";

import { jrsJson } from "@/app/lib/jrs-supabase";

export type NoticeKind = "correction" | "concern" | "retraction";

export type JrsNotice = {
  id: string;
  article_id: string;
  kind: NoticeKind;
  title: string;
  explanation: string;
  issued_at: string;
};

export type NoticeWithArticle = JrsNotice & {
  jrs_articles: {
    slug: string;
    title: string;
    authors: { name: string }[];
  };
};

export const noticeLabels: Record<NoticeKind, string> = {
  correction: "Виправлення",
  concern: "Повідомлення про занепокоєння",
  retraction: "Відкликання",
};

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function validNoticeId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export function noticeUrl(id: string): string {
  return `/notices/${id}`;
}

export function formatNoticeDate(timestamp: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function strongestNotice(notices: readonly JrsNotice[]): NoticeKind | null {
  if (notices.some(notice => notice.kind === "retraction")) return "retraction";
  if (notices.some(notice => notice.kind === "concern")) return "concern";
  if (notices.some(notice => notice.kind === "correction")) return "correction";
  return null;
}

/**
 * Public reads are RLS-filtered by published parent articles. Deliberately do
 * not swallow backend failures, which could hide a serious editorial notice.
 */
export async function noticesForPublishedArticle(articleId: string): Promise<JrsNotice[]> {
  if (!validNoticeId(articleId)) return [];
  return jrsJson<JrsNotice[]>(
    `/rest/v1/jrs_article_notices?article_id=eq.${articleId}&select=id,article_id,kind,title,explanation,issued_at&order=issued_at.desc&limit=200`
  );
}

export async function allPublicNotices(): Promise<NoticeWithArticle[]> {
  return jrsJson<NoticeWithArticle[]>(
    "/rest/v1/jrs_article_notices?select=id,article_id,kind,title,explanation,issued_at,jrs_articles!inner(slug,title,authors)&order=issued_at.desc&limit=200"
  );
}

export async function publicNoticeById(id: string): Promise<NoticeWithArticle | null> {
  if (!validNoticeId(id)) return null;
  const notices = await jrsJson<NoticeWithArticle[]>(
    `/rest/v1/jrs_article_notices?id=eq.${id}&select=id,article_id,kind,title,explanation,issued_at,jrs_articles!inner(slug,title,authors)&limit=1`
  );
  return notices[0] || null;
}

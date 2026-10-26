import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import { formatNoticeDate, noticeLabels, noticeUrl, publicNoticeById } from "@/app/lib/jrs-notices";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const notice = await publicNoticeById(id);
  if (!notice) return { title: "Повідомлення не знайдено | JRS" };
  return {
    title: `${noticeLabels[notice.kind]}: ${notice.jrs_articles.title} | JRS`,
    description: notice.explanation.slice(0, 170),
    alternates: { canonical: noticeUrl(notice.id) },
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = await publicNoticeById(id);
  if (!notice) notFound();
  const article = notice.jrs_articles;

  return (
    <JournalInfoLayout
      eyebrow={noticeLabels[notice.kind]}
      title={notice.title}
      description={`Офіційне редакційне повідомлення · ${formatNoticeDate(notice.issued_at)}`}
      sections={[
        { href: "#editorial-notice", label: "Текст повідомлення" },
        { href: "#related-publication", label: "Пов’язана стаття" },
      ]}
    >
      <p className="pub-back"><a href="/notices">← Усі редакційні повідомлення</a></p>
      <a className="jrs-en-article-uk-switch" href={`/en/notices/${notice.id}`} hrefLang="en">English reading interface ↗</a>
      <article className={`jrs-notice-detail is-${notice.kind}`} id="editorial-notice">
        <div className="jrs-notice-detail-top">
          <span>JRS / OFFICIAL EDITORIAL NOTICE</span>
          <strong>{noticeLabels[notice.kind]}</strong>
        </div>
        <time dateTime={notice.issued_at}>{formatNoticeDate(notice.issued_at)}</time>
        <h2>Підстави та пояснення редакції</h2>
        <p className="jrs-notice-detail-text">{notice.explanation}</p>
        {notice.kind === "retraction" && (
          <p className="jrs-notice-detail-warning">Роботу відкликано. Її результати й висновки не слід використовувати як надійне наукове джерело без урахування цього повідомлення.</p>
        )}
        {notice.kind === "concern" && (
          <p className="jrs-notice-detail-warning">Редакція повідомляє про питання до достовірності роботи. Це не тотожне встановленому порушенню та не є автоматичним відкликанням.</p>
        )}
      </article>

      <section className="jrs-notice-related" id="related-publication">
        <span>ПОВ’ЯЗАНА ПУБЛІКАЦІЯ</span>
        <h2><a href={`/publications/${article.slug}`}>{article.title} ↗</a></h2>
        <p>{article.authors.map(author => author.name).join(", ")}</p>
        <a href={`/publications/${article.slug}#publication-history`}>Переглянути історію статті ↗</a>
      </section>

      <p className="jrs-notice-detail-footnote">
        Повідомлення є окремим датованим елементом наукового запису JRS.
        Первісну публікацію не змінено приховано. Редакційні рішення ухвалюються
        відповідно до опублікованої <a href="/editorial-policy#corrections">редакційної політики</a>.
      </p>
    </JournalInfoLayout>
  );
}

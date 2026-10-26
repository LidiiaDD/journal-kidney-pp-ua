import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InternationalLayout from "@/app/components/InternationalLayout";
import { noticeUrl, publicNoticeById } from "@/app/lib/jrs-notices";
import {
  englishNoticeDate, englishNoticeHref, noticeLabelsEn,
  noticeDescriptionsEn, noticeSourceLanguageMessage,
} from "@/app/lib/jrs-english-notices";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const notice = await publicNoticeById(id);
  if (!notice) return { title: "Editorial notice not found | JRS", robots: { index: false } };
  // This view translates UI chrome, not the official document. Do not index
  // another copy of the same original-language editorial record.
  return {
    title: `${noticeLabelsEn[notice.kind]} | Journal of Renal Science`,
    description: noticeDescriptionsEn[notice.kind],
    alternates: { canonical: noticeUrl(notice.id) },
    robots: { index: false, follow: true },
  };
}

export default async function EnglishNoticeDetail({ params }: Props) {
  const { id } = await params;
  const notice = await publicNoticeById(id);
  if (!notice) notFound();
  const article = notice.jrs_articles;

  return (
    <InternationalLayout
      eyebrow={`OFFICIAL NOTICE / ${noticeLabelsEn[notice.kind].toUpperCase()}`}
      title={<span>{noticeLabelsEn[notice.kind]}</span>}
      lead={`An official post-publication decision issued on ${englishNoticeDate(notice.issued_at)}. The source editorial text is reproduced exactly as released.`}
    >
      <div className="wrap jrs-en-notice-detail-page">
        <div className="jrs-en-article-breadcrumb">
          <a href="/en/notices">← All editorial notices</a>
          <a href={noticeUrl(notice.id)} hrefLang="uk">Primary notice record ↗</a>
        </div>

        <article className={`jrs-en-notice-document kind-${notice.kind}`} aria-labelledby="jrs-en-notice-title">
          <div className="jrs-en-notice-document-top">
            <span>JRS / OFFICIAL EDITORIAL NOTICE</span>
            <span>{noticeLabelsEn[notice.kind]}</span>
          </div>
          <p className="jrs-en-notice-document-date">Issued <time dateTime={notice.issued_at}>{englishNoticeDate(notice.issued_at)}</time></p>
          <h2 id="jrs-en-notice-title" lang="und">{notice.title}</h2>
          <div className="jrs-en-notice-verbatim">
            <span>ORIGINAL EDITORIAL STATEMENT / VERBATIM</span>
            <p lang="und">{notice.explanation}</p>
          </div>

          <div className="jrs-en-notice-meaning">
            <h3>What this editorial decision means</h3>
            <p>{noticeDescriptionsEn[notice.kind]}</p>
            <small>This explanation identifies the type of notice; it is not a translation or reinterpretation of the official statement above.</small>
          </div>
          <div className="jrs-en-notice-document-actions">
            <a href={noticeUrl(notice.id)} hrefLang="uk">Read the primary editorial record ↗</a>
            <a href={englishNoticeHref(notice.id)} aria-current="page">English navigation</a>
          </div>
        </article>

        <section className="jrs-en-notice-related" aria-labelledby="jrs-en-related-article">
          <span className="jrs-en-eyebrow">RELATED SCIENTIFIC PUBLICATION</span>
          <h2 id="jrs-en-related-article" lang="und"><a href={`/en/publications/${article.slug}`}>{article.title} ↗</a></h2>
          <p>Authors: {article.authors.map(author => author.name).join(", ")}</p>
          <div>
            <a href={`/en/publications/${article.slug}`}>Read the article with English navigation ↗</a>
            <a href={`/publications/${article.slug}`} hrefLang="uk">Original publication page ↗</a>
          </div>
        </section>

        <div className="jrs-en-notices-language-note">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Source text preserved</strong>
            <p>{noticeSourceLanguageMessage} The notice's existence does not establish deliberate wrongdoing by any author.</p>
            <p>Read about JRS procedures in the <a href="/en/policy">English editorial policy ↗</a>.</p>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

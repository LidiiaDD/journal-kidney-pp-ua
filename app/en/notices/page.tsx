import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import { allPublicNotices } from "@/app/lib/jrs-notices";
import {
  englishNoticeDate, englishNoticeHref, noticeLabelsEn,
  noticeSourceLanguageMessage,
} from "@/app/lib/jrs-english-notices";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Editorial Notices | Journal of Renal Science",
  description: "The public register of JRS corrections, expressions of concern and retractions, with official source records and English navigation.",
  alternates: {
    canonical: "/en/notices",
    languages: { en: "/en/notices", uk: "/notices" },
  },
};

export default async function EnglishNoticesPage() {
  // The database returns only notices attached to publicly published articles.
  // A backend failure should never be displayed as an empty register.
  const notices = await allPublicNotices();
  const count = (kind: "correction" | "concern" | "retraction") =>
    notices.filter(item => item.kind === kind).length;

  return (
    <InternationalLayout
      eyebrow="RESEARCH INTEGRITY / EDITORIAL RECORD"
      title="An accountable scientific record."
      lead="A public register of dated corrections, expressions of concern and retractions issued by the Journal of Renal Science editorial office."
    >
      <div className="wrap jrs-en-notices-page">
        <div className="jrs-en-notices-overview">
          <div>
            <span className="jrs-en-eyebrow">JRS / OFFICIAL EDITORIAL RECORD</span>
            <h2>Transparency continues after publication.</h2>
            <p>Each official decision has a persistent link and an explanation from the editorial office. The notices below are reproduced in their original wording; the English interface does not change the editorial record.</p>
          </div>
          <div className="jrs-en-notices-stats" aria-label="Current official notice totals">
            <div><strong>{count("correction")}</strong><span>Corrections</span></div>
            <div><strong>{count("concern")}</strong><span>Expressions of concern</span></div>
            <div><strong>{count("retraction")}</strong><span>Retractions</span></div>
          </div>
        </div>

        {notices.length ? (
          <ol className="jrs-en-notices-list">
            {notices.map((notice, index) => (
              <li key={notice.id} className={`jrs-en-notices-entry kind-${notice.kind}`}>
                <span className="jrs-en-notices-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="jrs-en-notices-meta">
                    <span>{noticeLabelsEn[notice.kind]}</span>
                    <time dateTime={notice.issued_at}>{englishNoticeDate(notice.issued_at)}</time>
                  </div>
                  <h3><a href={englishNoticeHref(notice.id)}><span lang="und">{notice.title}</span></a></h3>
                  <p lang="und">{notice.explanation.length > 310 ? notice.explanation.slice(0, 310).trimEnd() + "…" : notice.explanation}</p>
                  <div className="jrs-en-notices-links">
                    <a href={englishNoticeHref(notice.id)}>View editorial notice ↗</a>
                    <a href={`/en/publications/${notice.jrs_articles.slug}`}>Related article ↗</a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="jrs-en-notices-empty">
            <span aria-hidden="true">✳</span>
            <h2>No official notices have been issued.</h2>
            <p>There are currently no public corrections, expressions of concern or retractions in the register. New notices will appear automatically when the editorial office issues them.</p>
            <a href="/en/publications">Explore published research ↗</a>
          </div>
        )}

        <div className="jrs-en-notices-explainer">
          <div>
            <span className="jrs-en-eyebrow">READING THE EDITORIAL RECORD</span>
            <h2>Three decisions, different meanings.</h2>
          </div>
          <div className="jrs-en-notices-types">
            <div><strong>01 / Correction</strong><p>A published clarification or correction of an identified error.</p></div>
            <div><strong>02 / Expression of concern</strong><p>A warning that important questions remain unresolved, not a finding of misconduct.</p></div>
            <div><strong>03 / Retraction</strong><p>A notice that the results should no longer be treated as reliable without consulting the editorial explanation.</p></div>
          </div>
        </div>

        <div className="jrs-en-notices-language-note">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Original editorial decisions, not machine translations</strong>
            <p>{noticeSourceLanguageMessage} For the primary register, see <a href="/notices" lang="uk" hrefLang="uk">the original-language editorial record ↗</a>.</p>
            <p>To receive new official notices in your RSS reader, add <a href="/feeds/notices.xml" type="application/rss+xml">the editorial notices RSS feed ↗</a>.</p>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

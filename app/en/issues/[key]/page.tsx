import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InternationalLayout from "@/app/components/InternationalLayout";
import IssueCover from "@/app/components/IssueCover";
import BookmarkButton from "@/app/components/BookmarkButton";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { groupPublishedIssues, parseIssueKey } from "@/app/lib/jrs-issues";
import { englishArticleView } from "@/app/lib/jrs-english-article";
import type { PublicationType } from "@/app/lib/publications";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ key: string }> };

const typeNames: Record<PublicationType, string> = {
  "original-research": "Original research",
  review: "Review article",
  "case-report": "Clinical case report",
  "brief-report": "Brief communication",
  perspective: "Perspective",
};

function englishDate(iso: string): string {
  const date = new Date(iso.slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  if (!parseIssueKey(key)) return { title: "Issue not found | JRS", robots: { index: false } };
  const issue = groupPublishedIssues(await allPublications()).find(entry => entry.key === key);
  if (!issue) return { title: "Issue not found | JRS", robots: { index: false } };
  return {
    title: `Volume ${issue.volume}, Issue ${issue.number} | Journal of Renal Science`,
    description: `Browse ${issue.articles.length} publicly released JRS research articles in volume ${issue.volume}, issue ${issue.number}.`,
    // The English UI is not a separate published issue. Index the source once.
    alternates: { canonical: `/issues/${issue.key}` },
    robots: { index: false, follow: true },
  };
}

export default async function EnglishIssueDetailPage({ params }: Props) {
  const { key } = await params;
  if (!parseIssueKey(key)) notFound();
  const issue = groupPublishedIssues(await allPublications()).find(entry => entry.key === key);
  if (!issue) notFound();

  return (
    <InternationalLayout
      eyebrow={`ISSUE CONTENTS / VOL. ${issue.volume} · NO. ${issue.number}`}
      title={<span>Volume {issue.volume}. <em>Issue {issue.number}.</em></span>}
      lead={`A published research collection containing ${issue.articles.length} ${issue.articles.length === 1 ? "article" : "articles"} with editor-confirmed volume and issue details.`}
    >
      <div className="wrap jrs-en-issue-detail-page">
        <nav className="jrs-en-article-breadcrumb" aria-label="Issue navigation">
          <a href="/en/issues">← Back to issue archive</a>
          <a href={`/issues/${issue.key}`} hrefLang="uk" lang="uk">Українська версія ↗</a>
        </nav>
        <div className="jrs-en-issue-detail-feature">
          <div className="jrs-en-issue-detail-cover">
            <IssueCover volume={issue.volume} number={issue.number}
              year={issue.latestArticleDate.slice(0,4)} size="large" locale="en" />
          </div>
          <div>
            <span className="jrs-en-eyebrow">JRS / VERIFIED ISSUE CONTENTS</span>
            <h2>A collection of published research.</h2>
            <p>The articles below share the volume and issue identifiers supplied in their published bibliographic records. Their content, authorship, original language and publication dates are preserved.</p>
            <div className="jrs-en-issue-detail-facts">
              <div><strong>{issue.articles.length}</strong><span>articles in collection</span></div>
              <div><strong>{englishDate(issue.latestArticleDate)}</strong><span>date of most recent article</span></div>
            </div>
          </div>
        </div>

        <section className="jrs-en-issue-contents" aria-labelledby="jrs-en-issue-contents-heading">
          <div className="jrs-en-issue-contents-heading">
            <span className="jrs-en-eyebrow">JRS / PUBLISHED CONTENTS</span>
            <h2 id="jrs-en-issue-contents-heading">Table of contents</h2>
          </div>
          <ol className="jrs-en-issue-contents-list">
            {issue.articles.map((article,index) => {
              const view = englishArticleView(article);
              return (
                <li key={article.slug} className="jrs-en-issue-content-entry">
                  <span className="jrs-en-issue-content-number">{String(index + 1).padStart(2,"0")}</span>
                  <div>
                    <div className="jrs-en-issue-content-meta">
                      <span>{typeNames[article.type]}</span>
                      <time dateTime={article.publishedAt}>{englishDate(article.publishedAt)}</time>
                      {article.pages && <span>Pages {article.pages}</span>}
                      <span>{view.englishAvailable ? "English metadata available" : "Original-language metadata"}</span>
                    </div>
                    <h3 lang={view.language}><a href={`/en/publications/${article.slug}`}>{view.metadata.title}</a></h3>
                    <p>{article.authors.map(author => author.name).join(", ")}</p>
                    <div className="jrs-en-issue-content-actions">
                      <a href={`/en/publications/${article.slug}`}>Read article ↗</a>
                      {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>}
                      <BookmarkButton slug={article.slug} locale="en" compact />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="jrs-en-issues-integrity">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>A bibliographic collection, not an invented publication event</strong>
            <p>The issue is assembled from genuine published records with the same volume and issue metadata. The most recent article date is not a verified issue release date. PDF language, independent review declarations and article-specific corrections must be checked on each publication page.</p>
            <p><a href="/en/publications">All released research ↗</a> · <a href="/en/notices">Corrections and retractions ↗</a></p>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InternationalLayout from "@/app/components/InternationalLayout";
import BookmarkButton from "@/app/components/BookmarkButton";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { findAuthorEntry } from "@/app/lib/jrs-contributors";
import { englishArticleView } from "@/app/lib/jrs-english-article";
import type { PublicationType } from "@/app/lib/publications";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ key: string }> };

const typeNames: Record<PublicationType, string> = {
  "original-research": "Original research",
  review: "Review",
  "case-report": "Clinical case report",
  "brief-report": "Brief communication",
  perspective: "Perspective",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const contributor = findAuthorEntry(await allPublications(), key);
  if (!contributor) return { title: "Contributor not found | JRS", robots: { index: false } };
  return {
    title: `${contributor.name} — JRS research contributions`,
    description: `Published research listing for ${contributor.name}: ${contributor.articles.length} bibliographic ${contributor.articles.length === 1 ? "article" : "articles"} in the Journal of Renal Science.`,
    alternates: { canonical: `/contributors/${contributor.key}` },
    robots: { index: false, follow: true },
  };
}

function formatDate(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric", day: "numeric" }).format(date);
}

export default async function EnglishContributorPage({ params }: Props) {
  const { key } = await params;
  const contributor = findAuthorEntry(await allPublications(), key);
  if (!contributor) notFound();
  const articles = [...contributor.articles].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "en")
  );

  return (
    <InternationalLayout
      eyebrow="CONTRIBUTORS / PUBLICATION RECORD"
      title={<span lang="und">{contributor.name}</span>}
      lead={`Bibliographic listing based on ${articles.length} publicly released ${articles.length === 1 ? "article" : "articles"} in Journal of Renal Science.`}
    >
      <div className="wrap jrs-en-contrib-profile">
        <nav className="jrs-en-article-breadcrumb" aria-label="Contributor navigation">
          <a href="/en/contributors">← All contributors</a>
          <a href={`/contributors/${contributor.key}`} hrefLang="uk" lang="uk">Українська версія ↗</a>
        </nav>

        <div className="jrs-en-contrib-profile-head">
          <span className="jrs-en-contrib-profile-avatar" aria-hidden="true">{contributor.initial}</span>
          <div className="jrs-en-contrib-profile-copy">
            <span className="jrs-en-eyebrow">JRS / PUBLIC BIBLIOGRAPHIC RECORD</span>
            <h2>{contributor.name}</h2>
            {contributor.affiliations.length > 0 && (
              <div className="jrs-en-contrib-affiliations">
                <strong>Affiliations as listed in published articles</strong>
                {contributor.affiliations.map(affiliation => <span key={affiliation}>{affiliation}</span>)}
              </div>
            )}
            {contributor.orcid && (
              <a className="jrs-en-contrib-orcid" href={`https://orcid.org/${contributor.orcid}`}
                target="_blank" rel="noopener noreferrer">
                ORCID provided in published metadata: {contributor.orcid} ↗
              </a>
            )}
          </div>
          <div className="jrs-en-contrib-profile-figure">
            <strong>{articles.length}</strong>
            <span>{articles.length === 1 ? "article" : "articles"} in JRS</span>
          </div>
        </div>

        <section className="jrs-en-contrib-works" aria-labelledby="jrs-en-contrib-works-title">
          <div className="jrs-en-contrib-works-top">
            <span className="jrs-en-eyebrow">JRS / PUBLICATION RECORD</span>
            <h2 id="jrs-en-contrib-works-title">Scientific contributions</h2>
            <p>Articles are presented by publication date. Names and affiliations are preserved as recorded by the editorial office; English publication titles are shown only when supplied as complete metadata.</p>
          </div>
          <ol className="jrs-en-contrib-works-list">
            {articles.map((article, index) => {
              const display = englishArticleView(article);
              return (
                <li key={article.slug} className="jrs-en-contrib-work">
                  <span className="jrs-en-contrib-work-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="jrs-en-contrib-work-meta">
                      <span>{typeNames[article.type]}</span>
                      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                      <span>{display.englishAvailable ? "English metadata available" : "Original-language metadata"}</span>
                    </div>
                    <h3 lang={display.language}>
                      <a href={`/en/publications/${article.slug}`}>{display.metadata.title}</a>
                    </h3>
                    <p>{article.authors.map(author => author.name).join(", ")}</p>
                    <div className="jrs-en-contrib-work-actions">
                      <a href={`/en/publications/${article.slug}`}>View article ↗</a>
                      {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>}
                      <BookmarkButton slug={article.slug} compact locale="en" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="jrs-en-contrib-integrity">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>About this contributor record</strong>
            <p>This is not a claimed personal account, an independently verified identity, a biography or an academic CV. It only presents contributor metadata from publicly released JRS papers. For corrections to authorship or affiliations, please contact the editorial office.</p>
            <a href="mailto:editor@kidney.pp.ua?subject=JRS%20-%20Contributor%20record%20correction">Request an editorial correction ↗</a>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

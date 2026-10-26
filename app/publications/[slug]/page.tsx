import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublicArticle } from "@/app/lib/jrs-catalogue";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ArticleContent, { articleSectionLinks } from "@/app/components/ArticleContent";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { articleUrl } from "@/app/lib/citations";
import { issueHref, makeIssueKey } from "@/app/lib/jrs-issues";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await findPublicArticle(slug);
  if (!article) return { title: "Публікацію не знайдено | JRS" };
  return {
    title: `${article.title} | Journal of Renal Science`,
    description: article.abstract.slice(0, 175),
    alternates: { canonical: `/publications/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.abstract.slice(0, 175),
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const article = await findPublicArticle(slug);
  if (!article) notFound();

  return (
    <JournalInfoLayout
      eyebrow="Наукова публікація"
      title={article.title}
      description={`${publicationTypeLabels[article.type]} · ${formatPublicationDate(article.publishedAt)}`}
      sections={articleSectionLinks(Boolean(article.pdfUrl), false, Boolean(article.references?.length))}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        headline: article.title,
        inLanguage: article.language,
        datePublished: article.publishedAt,
        author: article.authors.map(author => ({
          "@type": "Person", name: author.name,
          ...(author.affiliation ? { affiliation: { "@type": "Organization", name: author.affiliation } } : {}),
          ...(author.orcid ? { identifier: `https://orcid.org/${author.orcid}` } : {}),
        })),
        abstract: article.abstract,
        keywords: article.keywords,
        isPartOf: { "@type": "Periodical", name: "Journal of Renal Science" },
        mainEntityOfPage: articleUrl(article),
        ...(article.doi ? { identifier: `https://doi.org/${article.doi}` } : {}),
        ...(article.translations?.en?.title && article.language === "uk"
          ? { alternativeHeadline: article.translations.en.title } : {}),
        ...(article.translations?.uk?.title && article.language === "en"
          ? { alternativeHeadline: article.translations.uk.title } : {}),
      }).replace(/</g, "\\u003c") }} />
      <p className="pub-back"><a href="/publications">← Усі публікації</a></p>
      {article.volume && article.issue && (
        <a className="jrs-article-issue-reference"
          href={issueHref(makeIssueKey(article.volume, article.issue))}>
          <span>Матеріал випуску</span>
          <strong>Том {article.volume} · № {article.issue}</strong>
          <b aria-hidden="true">↗</b>
        </a>
      )}
      <ArticleContent article={article} />
    </JournalInfoLayout>
  );
}

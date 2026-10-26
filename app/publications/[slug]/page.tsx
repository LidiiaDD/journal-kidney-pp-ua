import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublicArticle } from "@/app/lib/jrs-catalogue";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ArticleContent, { articleSectionLinks } from "@/app/components/ArticleContent";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";

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
      sections={articleSectionLinks(Boolean(article.pdfUrl))}
    >
      <p className="pub-back"><a href="/publications">← Усі публікації</a></p>
      <ArticleContent article={article} />
    </JournalInfoLayout>
  );
}

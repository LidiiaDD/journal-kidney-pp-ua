import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InternationalLayout from "@/app/components/InternationalLayout";
import EnglishArticleContent from "@/app/components/EnglishArticleContent";
import { findPublicArticle } from "@/app/lib/jrs-catalogue";
import { englishArticleView } from "@/app/lib/jrs-english-article";
import { getPublishedRow, isJrsConfigured } from "@/app/lib/jrs-supabase";
import { noticesForPublishedArticle } from "@/app/lib/jrs-notices";
import type { Publication } from "@/app/lib/publications";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

const types: Record<Publication["type"], string> = {
  "original-research": "Original research",
  review: "Review",
  "case-report": "Case report",
  "brief-report": "Brief communication",
  perspective: "Perspective",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await findPublicArticle(slug);
  if (!article) return { title: "Article not found | Journal of Renal Science", robots: { index: false } };
  const display = englishArticleView(article);
  const equivalents = display.translated
    ? { en: `/en/publications/${article.slug}`, uk: `/publications/${article.slug}` }
    : undefined;

  return {
    title: `${display.metadata.title} | Journal of Renal Science`,
    description: display.metadata.abstract.slice(0, 175),
    alternates: {
      canonical: display.canonical,
      ...(equivalents ? { languages: equivalents } : {}),
    },
    ...(display.indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "article",
      title: display.metadata.title,
      description: display.metadata.abstract.slice(0, 175),
      publishedTime: article.publishedAt,
      locale: display.englishAvailable ? "en_US" : "uk_UA",
      url: display.canonical,
    },
  };
}

export default async function EnglishArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await findPublicArticle(slug);
  if (!article) notFound();

  // The notice backend must not silently fail: omitting a retraction would
  // mislead a researcher. Static curated articles can exist without a DB row.
  const row = isJrsConfigured() ? await getPublishedRow(slug) : null;
  const notices = row ? await noticesForPublishedArticle(row.id) : [];
  const display = englishArticleView(article);

  return (
    <InternationalLayout
      eyebrow="RESEARCH / PUBLISHED ARTICLE"
      title={<span lang={display.language}>{display.metadata.title}</span>}
      lead={`${types[article.type]} · ${article.publishedAt} · ${display.englishAvailable ? "English metadata" : "Original-language metadata"}`}
    >
      <EnglishArticleContent article={article} notices={notices}/>
    </InternationalLayout>
  );
}

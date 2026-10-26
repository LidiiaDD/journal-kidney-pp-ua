import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ArticleContent, { articleSectionLinks } from "@/app/components/ArticleContent";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { getEditorArticle, requireEditor, rowToPublication } from "@/app/lib/jrs-supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Приватний перегляд статті | JRS",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function ArticlePreviewPage({ params }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  const row = await getEditorArticle(id, token);
  if (!row) notFound();

  const article = rowToPublication(row);
  const draft = row.status === "draft";
  const file = row.pdf_path ? `/admin/articles/${row.id}/pdf` : undefined;

  return (
    <JournalInfoLayout
      eyebrow={draft ? "Приватний перегляд" : "Опублікований матеріал"}
      title={article.title}
      description={draft
        ? `${publicationTypeLabels[article.type]} · чернетка, ще не опубліковано`
        : `${publicationTypeLabels[article.type]} · ${formatPublicationDate(article.publishedAt)}`}
      sections={articleSectionLinks(Boolean(file), draft)}
    >
      <p className="pub-back"><a href={`/admin/articles/${id}`}>← Повернутися до редагування</a></p>
      <ArticleContent article={article} draft={draft} pdfUrl={file} />
    </JournalInfoLayout>
  );
}

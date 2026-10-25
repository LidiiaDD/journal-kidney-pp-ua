import { notFound } from "next/navigation";
import { getEditorArticle, requireEditor } from "@/app/lib/jrs-supabase";
import ArticleForm from "../../components/ArticleForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; created?: string; saved?: string; published?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  const article = await getEditorArticle(id, token);
  if (!article) notFound();
  const flags = await searchParams;
  return (
    <main className="jrs-admin-main">
      <div className="wrap">
        <a href="/admin" className="jrs-admin-back">← Матеріали журналу</a>
        <div className="jrs-admin-heading"><div>
          <p className="jrs-admin-kicker">{article.status === "draft" ? "Приватна чернетка" : "Опубліковано"}</p>
          <h1>{article.status === "draft" ? "Редагування статті" : "Опублікована стаття"}</h1>
          <p>Картка матеріалу · {article.slug}</p>
        </div></div>
        <ArticleForm article={article} {...flags} />
      </div>
    </main>
  );
}

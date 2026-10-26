import { notFound } from "next/navigation";
import { getEditorArticle, requireEditor } from "@/app/lib/jrs-supabase";
import ArticleForm from "../../components/ArticleForm";
import EditorNoticePanel from "../../components/EditorNoticePanel";
import { noticesForPublishedArticle } from "@/app/lib/jrs-notices";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; created?: string; saved?: string; published?: string; noticeAdded?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  const article = await getEditorArticle(id, token);
  if (!article) notFound();
  const flags = await searchParams;
  const notices = article.status === "published" ? await noticesForPublishedArticle(article.id) : [];
  return (
    <main className="jrs-admin-main">
      <div className="wrap">
        <a href="/admin" className="jrs-admin-back">← Матеріали журналу</a>
        <div className="jrs-admin-heading"><div>
          <p className="jrs-admin-kicker">{article.status === "draft" ? "Приватна чернетка" : "Опубліковано"}</p>
          <h1>{article.status === "draft" ? "Редагування статті" : "Опублікована стаття"}</h1>
          <p>Картка матеріалу · {article.slug}</p>
        </div></div>
        <a className="jrs-preflight-teaser" href={`/admin/articles/${article.id}/preflight`}>
          <span>
            <small>JRS · ПЕРЕДПУБЛІКАЦІЙНИЙ КОНТРОЛЬ</small>
            <strong>Перевірити метадані та декларації</strong>
            <em>Приватний звіт щодо повноти збереженого запису. Без змін, оприлюднення чи автоматичних схвалень.</em>
          </span>
          <b aria-hidden="true">↗</b>
        </a>
        <ArticleForm article={article} {...flags} />
        {article.status === "published" && (
          <EditorNoticePanel articleId={article.id} notices={notices}
            error={flags.error} added={flags.noticeAdded === "1"} />
        )}
      </div>
    </main>
  );
}

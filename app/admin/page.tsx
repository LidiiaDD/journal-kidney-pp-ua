import { listEditorArticles, requireEditor } from "@/app/lib/jrs-supabase";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { token, editor } = await requireEditor();
  const { error } = await searchParams;
  let articles: Awaited<ReturnType<typeof listEditorArticles>> = [];
  let loadingError = false;
  try { articles = await listEditorArticles(token); }
  catch { loadingError = true; }

  return (
    <main className="jrs-admin-main">
      <div className="wrap">
        <div className="jrs-admin-heading">
          <div>
            <p className="jrs-admin-kicker">Управління публікаціями</p>
            <h1>Матеріали журналу</h1>
            <p>Доступ дозволено: {editor.email || "редактор JRS"}. Чернетки не бачать читачі сайту.</p>
          </div>
          <a className="jrs-admin-primary" href="/admin/articles/new">+ Нова стаття</a>
        </div>

        {(loadingError || error) && (
          <div className="jrs-admin-notice error" role="alert">
            {loadingError ? "Не вдалося завантажити матеріали. Перевірте підключення до Supabase та політики доступу."
              : "Операцію не виконано. Перевірте, чи є матеріал чернеткою."}
          </div>
        )}

        {articles.length === 0 && !loadingError ? (
          <div className="jrs-admin-empty">
            <h2>Поки немає рукописів</h2>
            <p>Створіть першу чернетку, заповніть бібліографічні відомості та, за потреби, завантажте PDF. Публікація відбудеться лише після вашого окремого підтвердження.</p>
            <a href="/admin/articles/new">Створити чернетку ↗</a>
          </div>
        ) : (
          <div className="jrs-admin-list">
            {articles.map((article) => (
              <article key={article.id} className="jrs-admin-item">
                <div>
                  <span className={`jrs-admin-status ${article.status}`}>
                    {article.status === "published" ? "Опубліковано" : "Чернетка"}
                  </span>
                  <h2><a href={`/admin/articles/${article.id}`}>{article.title}</a></h2>
                  <p>
                    {publicationTypeLabels[article.type]} · {article.authors.map((author) => author.name).join(", ")}
                    {article.published_at && <> · {formatPublicationDate(article.published_at)}</>}
                  </p>
                </div>
                <a href={`/admin/articles/${article.id}`}>{article.status === "draft" ? "Редагувати" : "Переглянути"} ↗</a>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

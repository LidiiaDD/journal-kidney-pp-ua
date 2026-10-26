import { listEditorArticles, requireEditor } from "@/app/lib/jrs-supabase";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { analyzeEditorialTriage } from "@/app/lib/jrs-editor-triage";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { token, editor } = await requireEditor();
  const { error } = await searchParams;
  let articles: Awaited<ReturnType<typeof listEditorArticles>> = [];
  let loadingError = false;
  try { articles = await listEditorArticles(token); }
  catch { loadingError = true; }

  // Only authenticated, saved rows are analyzed; no manuscript data is sent
  // to the browser beyond the private editor page itself.
  const triage = loadingError ? null : analyzeEditorialTriage(articles);
  const blockerCounts = new Map(triage?.drafts.map(item => [item.article.id, item.blockers.length]) ?? []);

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

        <a href="/admin/issues" className="jrs-issue-work-teaser">
          <span><small>EDITORIAL WORKSPACE · JRS</small>
            <strong>Підготовка випусків</strong>
            <em>Плануйте томи й номери та відстежуйте, які статті залишаються чернетками.</em>
          </span><b aria-hidden="true">↗</b>
        </a>

        {triage && articles.length > 0 && (
          <section className="jrs-editor-triage" aria-labelledby="jrs-editor-triage-heading">
            <header className="jrs-editor-triage-head">
              <div>
                <p className="jrs-admin-kicker">PRIVATE EDITORIAL CONTROL</p>
                <h2 id="jrs-editor-triage-heading">Робочий огляд рукописів</h2>
                <p>Технічна перевірка збережених чернеток перед редакційним рішенням.
                  Вона не оцінює наукову якість і не засвідчує етичне схвалення.</p>
              </div>
              <a href="/admin/issues">Підготовка випусків ↗</a>
            </header>
            <div className="jrs-editor-triage-stats">
              <div><strong>{triage.drafts.length}</strong><span>приватних чернеток</span></div>
              <div><strong>{triage.draftsNeedingMetadata}</strong><span>потребують технічних правок</span></div>
              <div><strong>{triage.draftsWithoutTechnicalBlockers}</strong><span>без технічних блокерів — не схвалені автоматично</span></div>
              <div><strong>{triage.publishedCount}</strong><span>уже оприлюднених записів</span></div>
            </div>
            {triage.commonBlockers.length > 0 && (
              <div className="jrs-editor-triage-common">
                <strong>Найчастіші технічні питання</strong>
                <p>{triage.commonBlockers.slice(0, 4).map(item =>
                  `${item.title}: ${item.count}`).join(" · ")}</p>
              </div>
            )}
            {triage.possiblyIncomplete && (
              <p className="jrs-editor-triage-limit" role="status">
                Отримано 300 останніх записів — це може бути неповний архів.
                Підсумки стосуються лише доступної вибірки.
              </p>
            )}
          </section>
        )}

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
                  {article.status === "draft" && (
                    <p className="jrs-editor-triage-inline">
                      {(blockerCounts.get(article.id) ?? 0) > 0
                        ? `Технічних пунктів для виправлення: ${blockerCounts.get(article.id)}`
                        : "Технічні блокери відсутні; потрібне рішення редакції"}
                    </p>
                  )}
                </div>
                <div className="jrs-editor-triage-actions">
                  <a href={`/admin/articles/${article.id}`}>{article.status === "draft" ? "Редагувати" : "Переглянути"} ↗</a>
                  {article.status === "draft" && <a href={`/admin/articles/${article.id}/preflight`}>Перевірити ↗</a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

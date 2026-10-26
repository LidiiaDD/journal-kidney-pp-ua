import type { Metadata } from "next";
import { requireEditor, listEditorArticles } from "@/app/lib/jrs-supabase";
import type { ArticleRow } from "@/app/lib/jrs-supabase";
import { analyzeIssuePreparation } from "@/app/lib/jrs-issue-preparation";
import { issueHref, makeIssueKey } from "@/app/lib/jrs-issues";

export const metadata: Metadata = {
  title: "Підготовка випусків | Редакція JRS",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function ArticleLinks({ article }: { article: ArticleRow }) {
  return (
    <li className="jrs-issue-work-item">
      <div>
        <strong>{article.title}</strong>
        <span>{article.status === "draft" ? "Приватна чернетка" : "Опубліковано"}</span>
      </div>
      <div>
        <a href={`/admin/articles/${article.id}`}>
          {article.status === "draft" ? "Редагувати ↗" : "Картка ↗"}
        </a>
        {article.status === "draft" && (
          <a href={`/admin/articles/${article.id}/preflight`}>Аудит ↗</a>
        )}
      </div>
    </li>
  );
}

export default async function EditorialIssuesPage() {
  const { token } = await requireEditor();
  let articles: Awaited<ReturnType<typeof listEditorArticles>>;
  try {
    articles = await listEditorArticles(token);
  } catch {
    return (
      <main className="jrs-admin-main">
        <div className="wrap jrs-editorial-issues">
          <a className="jrs-admin-back" href="/admin">← Матеріали журналу</a>
          <h1>Підготовка випусків</h1>
          <div className="jrs-admin-notice error" role="alert">
            Не вдалося отримати матеріали. Аналіз випусків недоступний, доки
            не відновиться безпечне підключення до бази JRS.
          </div>
        </div>
      </main>
    );
  }
  const plan = analyzeIssuePreparation(articles);
  const groupedPublished = plan.groups.reduce((sum, group) => sum + group.published.length, 0);
  const assignedDrafts = plan.groups.reduce((sum, group) => sum + group.drafts.length, 0);
  const hasIncomplete = plan.partialDrafts.length + plan.partialPublished.length
    + plan.invalidDrafts.length + plan.invalidPublished.length > 0;

  return (
    <main className="jrs-admin-main">
      <div className="wrap jrs-editorial-issues">
        <a className="jrs-admin-back" href="/admin">← Матеріали журналу</a>
        <header className="jrs-issue-work-header">
          <div>
            <p className="jrs-admin-kicker">JRS / PRIVATE ISSUE PLANNING</p>
            <h1>Підготовка випусків</h1>
            <p>Приватна робоча карта рукописів за томами й номерами. Чернетки залишаються
              чернетками, а публічний випуск існує лише тоді, коли до нього вже
              віднесено оприлюднені статті.</p>
          </div>
          <a className="jrs-admin-primary" href="/admin/articles/new">+ Нова чернетка</a>
        </header>

        <div className="jrs-issue-work-stats" aria-label="Статистика редакційної підготовки">
          <div><strong>{plan.totalDrafts}</strong><span>приватних чернеток</span></div>
          <div><strong>{assignedDrafts}</strong><span>чернеток із повними реквізитами випуску</span></div>
          <div><strong>{groupedPublished}</strong><span>публікацій у нумерованих випусках</span></div>
          <div><strong>{plan.groups.filter(group => group.published.length > 0).length}</strong>
            <span>публічних груп випусків</span></div>
        </div>

        {plan.possiblyTruncated && (
          <div className="jrs-admin-notice error" role="status">
            Показано останні 300 редакційних записів. Це може бути неповний
            огляд архіву; відсутність інших статей не доведена.
          </div>
        )}

        <div className="jrs-issue-work-note">
          <strong>Важливо</strong>
          <p>Ця сторінка не присвоює ISSN, DOI, номерів випусків чи дат їх виходу.
            Заповнені поля не підтверджують наукове рецензування або згоду авторів.
            Оприлюднення залишається окремою ручною дією на картці кожної статті.</p>
        </div>

        <section className="jrs-issue-work-section" aria-labelledby="planned-group-title">
          <div className="jrs-issue-work-section-heading">
            <span>01 / РОБОЧІ ГРУПИ</span>
            <h2 id="planned-group-title">Томи й номери</h2>
            <p>Групування лише за заповненими реквізитами. Група з одними
              чернетками не створює публічного випуску.</p>
          </div>
          {plan.groups.length === 0 ? (
            <div className="jrs-issue-work-empty">
              <h3>Жодному матеріалу ще не присвоєно обидва реквізити.</h3>
              <p>Перший випуск не створюється наперед: підготуйте рукопис,
                визначте затверджені редакцією том і номер та пройдіть
                перевірку перед фактичним оприлюдненням.</p>
            </div>
          ) : (
            <div className="jrs-issue-work-group-list">
              {plan.groups.map(group => (
                <article key={group.key} className="jrs-issue-work-group">
                  <header>
                    <div>
                      <span>JRS / VOLUME {group.volume} / ISSUE {group.number}</span>
                      <h3>Том {group.volume} · № {group.number}</h3>
                    </div>
                    {group.published.length > 0
                      ? <a href={issueHref(makeIssueKey(group.volume, group.number))}
                          target="_blank" rel="noopener noreferrer">Публічний зміст ↗</a>
                      : <span className="jrs-issue-work-private">Лише внутрішня підготовка</span>}
                  </header>
                  <div className="jrs-issue-work-columns">
                    <div>
                      <h4>Чернетки <span>{group.drafts.length}</span></h4>
                      {group.drafts.length > 0
                        ? <ul>{group.drafts.map(article => <ArticleLinks key={article.id} article={article}/>)}</ul>
                        : <p className="jrs-issue-work-muted">Не призначено чернеток.</p>}
                    </div>
                    <div>
                      <h4>Опубліковані <span>{group.published.length}</span></h4>
                      {group.published.length > 0
                        ? <ul>{group.published.map(article => <ArticleLinks key={article.id} article={article}/>)}</ul>
                        : <p className="jrs-issue-work-muted">Публічних статей ще немає.</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="jrs-issue-work-section" aria-labelledby="incomplete-group-title">
          <div className="jrs-issue-work-section-heading">
            <span>02 / РЕКВІЗИТИ</span>
            <h2 id="incomplete-group-title">Потребують уточнення</h2>
            <p>Неповні або завеликі значення тому й номера не утворюють випуск.</p>
          </div>
          {hasIncomplete ? (
            <div className="jrs-issue-work-problems">
              {([
                ["Чернетки з одним реквізитом", plan.partialDrafts],
                ["Опубліковані з одним реквізитом", plan.partialPublished],
                ["Чернетки з надто довгим реквізитом", plan.invalidDrafts],
                ["Опубліковані з надто довгим реквізитом", plan.invalidPublished],
              ] as [string, ArticleRow[]][]).filter(([,list])=>list.length).map(([label,list]) => (
                <div key={label}>
                  <h3>{label} · {list.length}</h3>
                  <ul>{list.map(article=><ArticleLinks key={article.id} article={article}/>)}</ul>
                </div>
              ))}
            </div>
          ) : <p className="jrs-issue-work-muted">Неповних пар тому й номера серед отриманих записів немає.</p>}
        </section>

        <section className="jrs-issue-work-section" aria-labelledby="unassigned-group-title">
          <div className="jrs-issue-work-section-heading">
            <span>03 / ЗАГАЛЬНИЙ КАТАЛОГ</span>
            <h2 id="unassigned-group-title">Поки без реквізитів випуску</h2>
            <p>Ці матеріали не губляться. Опубліковані роботи залишаються в загальному
              каталозі, а чернетки — у приватному кабінеті.</p>
          </div>
          <div className="jrs-issue-work-columns jrs-issue-work-loose">
            <div>
              <h3>Чернетки · {plan.unassignedDrafts.length}</h3>
              {plan.unassignedDrafts.length
                ? <ul>{plan.unassignedDrafts.map(article => <ArticleLinks key={article.id} article={article}/>)}</ul>
                : <p className="jrs-issue-work-muted">Немає.</p>}
            </div>
            <div>
              <h3>Опубліковані · {plan.unassignedPublished.length}</h3>
              {plan.unassignedPublished.length
                ? <ul>{plan.unassignedPublished.map(article => <ArticleLinks key={article.id} article={article}/>)}</ul>
                : <p className="jrs-issue-work-muted">Немає.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

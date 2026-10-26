import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEditorArticle, requireEditor } from "@/app/lib/jrs-supabase";
import { auditSavedArticle } from "@/app/lib/jrs-preflight";
import { publicationBlockers } from "@/app/lib/jrs-publication-gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Передпублікаційний аудит | JRS",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

const stateLabel = {
  filled: "Є запис",
  attention: "Потребує уваги",
  optional: "Необов’язково / перевірити",
} as const;

export default async function ArticlePreflightPage({ params }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  const article = await getEditorArticle(id, token);
  if (!article) notFound();

  const sections = auditSavedArticle(article);
  const all = sections.flatMap(section => section.items);
  const attention = all.filter(check => check.status === "attention");
  const filled = all.filter(check => check.status === "filled").length;
  const published = article.status === "published";
  const blockers = publicationBlockers(article);

  return (
    <main className="jrs-admin-main">
      <div className="wrap jrs-preflight">
        <a className="jrs-admin-back" href={`/admin/articles/${article.id}`}>← Повернутися до статті</a>
        <div className="jrs-preflight-head">
          <div>
            <p className="jrs-admin-kicker">JRS / EDITORIAL QUALITY CONTROL</p>
            <h1>Передпублікаційний аудит</h1>
            <p className="jrs-preflight-article-title">{article.title}</p>
            <p className="jrs-preflight-context">
              {published ? "Опублікована версія · тільки перегляд" : "Приватна чернетка · тільки перегляд"}
            </p>
          </div>
          <div className="jrs-preflight-count" aria-label="Стан перевірки запису">
            <strong>{attention.length}</strong>
            <span>пунктів для уваги</span>
          </div>
        </div>

        <div className="jrs-preflight-warning">
          <strong>Це перевірка повноти збереженого запису, а не експертний висновок.</strong>
          <p>Наявність тексту не підтверджує згоду авторів, правильність статистики, чинність DOI, етичне схвалення, анонімізацію PDF або факт незалежного рецензування. Відомості не надсилаються стороннім сервісам. Зміни у формі з’являться тут лише після збереження чернетки.</p>
        </div>

        <section className="jrs-publish-gate" aria-labelledby="jrs-publish-gate-title">
          <div className="jrs-publish-gate-head">
            <span>TECHNICAL PUBLICATION GATE</span>
            <h2 id="jrs-publish-gate-title">Перевірка умов серверної публікації</h2>
            <p>Тут використано ті самі технічні правила, що й у команді
              «Опублікувати». Це не підтвердження наукової якості, етики,
              згоди авторів чи факту зовнішнього рецензування.</p>
          </div>
          {blockers.length ? (
            <div>
              <strong className="jrs-publish-gate-status">
                {blockers.length} технічних пунктів потребують виправлення
              </strong>
              <ul className="jrs-publish-gate-list">
                {blockers.map(blocker => (
                  <li key={blocker.code}>
                    <strong>{blocker.title}</strong>
                    <p>{blocker.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="jrs-publish-gate-clear">
              Технічних блокерів у збереженому записі не знайдено.
              Перед оприлюдненням обов’язково підтвердьте чотири незалежні
              редакційні перевірки та перегляньте остаточний рукопис.
            </p>
          )}
        </section>

        <div className="jrs-preflight-stats">
          <div><span>Усього пунктів</span><strong>{all.length}</strong></div>
          <div><span>Мають заповнені відомості</span><strong>{filled}</strong></div>
          <div><span>Потребують уваги</span><strong>{attention.length}</strong></div>
        </div>

        <nav className="jrs-preflight-index" aria-label="Розділи аудиту">
          {sections.map(section => <a key={section.id} href={`#audit-${section.id}`}>{section.title} ↘</a>)}
        </nav>

        {sections.map(section => (
          <section className="jrs-preflight-section" id={`audit-${section.id}`} key={section.id}>
            <div className="jrs-preflight-section-heading">
              <h2>{section.title}</h2>
              <p>{section.summary}</p>
            </div>
            <div className="jrs-preflight-items">
              {section.items.map(check => (
                <article className={`jrs-preflight-item jrs-preflight-item--${check.status}`} key={check.id}>
                  <div>
                    <h3>{check.label}</h3>
                    <p>{check.detail}</p>
                  </div>
                  <span>{stateLabel[check.status]}</span>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="jrs-preflight-final">
          <div>
            <h2>Рішення залишається за редакцією</h2>
            <p>Чотири обов’язкові підтвердження — згода авторів, етика, захист даних і достовірність матеріалів — заповнюються особисто в редакторській формі. Автоматична перевірка їх не замінює й сама нічого не публікує.</p>
          </div>
          <a href={`/admin/articles/${article.id}`}>{published ? "Повернутися до картки статті ↗" : "Виправити чернетку ↗"}</a>
        </section>
        <div className="jrs-preflight-sources">
          Наукові орієнтири: <a href="https://www.icmje.org/recommendations/" target="_blank" rel="noopener noreferrer">ICMJE</a>
          {" · "}
          <a href="https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier" target="_blank" rel="noopener noreferrer">контрольна цифра ORCID</a>.
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import IssueCover from "@/app/components/IssueCover";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { groupPublishedIssues, issueHref } from "@/app/lib/jrs-issues";
import { formatPublicationDate } from "@/app/lib/publications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Архів випусків | Journal of Renal Science",
  description: "Візуальний архів випусків Journal of Renal Science: обкладинки, томи й номери, зміст і реальні наукові статті.",
  alternates: { canonical: "/issues", languages: { uk: "/issues", en: "/en/issues" } },
};

export default async function IssuesPage() {
  const articles = await allPublications();
  const issues = groupPublishedIssues(articles);
  const assigned = new Set(issues.flatMap(issue => issue.articles.map(article => article.slug)));
  const ungroupedCount = articles.filter(article => !assigned.has(article.slug)).length;
  const latest = issues[0];

  return (
    <JournalInfoLayout
      eyebrow="Архів випусків"
      title="Наука, зібрана у випуски."
      description="Візуальна колекція опублікованих матеріалів JRS за підтвердженими редакційними даними про том і номер."
      sections={[]}
      wide
    >
      <a className="jrs-en-article-uk-switch" href="/en/issues" hrefLang="en">English issues archive ↗</a>
      <div className="jrs-issues-intro">
        <div>
          <p className="jrs-issues-eyebrow">JRS / THE ISSUE ARCHIVE</p>
          <h2>Кожна стаття має свою історію. Кожен випуск — своє обличчя.</h2>
          <p>Тут з’являються лише випуски, до яких уже віднесено реально опубліковані статті. Обкладинки формуються автоматично, а зміст пов’язаний із науковим архівом.</p>
        </div>
        <div className="jrs-issues-numbers">
          <strong>{issues.length}</strong>
          <span>випусків із публікаціями</span>
          <i aria-hidden="true"/>
          <strong>{articles.length}</strong>
          <span>усього опублікованих матеріалів</span>
        </div>
      </div>

      {latest ? (
        <>
          <section className="jrs-issues-feature" aria-label="Останній представлений випуск">
            <div className="jrs-issues-feature-visual">
              <a href={issueHref(latest.key)} aria-label={`Переглянути том ${latest.volume}, номер ${latest.number}`}>
                <IssueCover volume={latest.volume} number={latest.number} year={latest.latestArticleDate.slice(0,4)} size="large"/>
              </a>
            </div>
            <div className="jrs-issues-feature-copy">
              <p className="jrs-issues-eyebrow">LATEST RESEARCH COLLECTION</p>
              <h2>Том {latest.volume}. <em>Випуск {latest.number}.</em></h2>
              <p>Добірка оприлюднених досліджень із зазначеними редакцією реквізитами випуску. Кожна робота має власну сторінку, анотацію та наукові метадані.</p>
              <div className="jrs-issues-feature-facts">
                <span><strong>{latest.articles.length}</strong> матеріалів у добірці</span>
                <span><strong>{formatPublicationDate(latest.latestArticleDate)}</strong> дата останньої статті</span>
              </div>
              <a className="jrs-issue-link-main" href={issueHref(latest.key)}>Відкрити зміст випуску ↗</a>
            </div>
          </section>
          {issues.length > 1 && (
            <section className="jrs-issues-archive" aria-labelledby="issue-archive-title">
              <div className="jrs-issues-section-head">
                <p className="jrs-issues-eyebrow">COMPLETE ISSUE ARCHIVE</p>
                <h2 id="issue-archive-title">Попередні випуски</h2>
              </div>
              <div className="jrs-issues-grid">
                {issues.slice(1).map((issue, index) => (
                  <a key={issue.key} className="jrs-issues-grid-card" href={issueHref(issue.key)}>
                    <IssueCover volume={issue.volume} number={issue.number}
                      year={issue.latestArticleDate.slice(0,4)} variant={index + 1}/>
                    <div className="jrs-issues-grid-copy">
                      <strong>Том {issue.volume} · № {issue.number}</strong>
                      <span>{issue.articles.length} матеріалів · Зміст випуску ↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="jrs-issues-upcoming">
          <div className="jrs-issues-upcoming-cover">
            <IssueCover upcoming size="large" />
          </div>
          <div className="jrs-issues-upcoming-copy">
            <p className="jrs-issues-eyebrow">CURRENT STATUS / IN PREPARATION</p>
            <h2>Перший випуск <em>ще попереду.</em></h2>
            <p>Наразі редакція формує архів. Ми не публікуємо вигадані обкладинки як реальні номери, не призначаємо довільних дат випуску та не додаємо демонстраційні статті.</p>
            <p>Коли редакція оприлюднить матеріали з підтвердженими даними про том і випуск, тут автоматично з’являться оформлена обкладинка та зміст.</p>
            <a href="/authors" className="jrs-issue-link-main">Ознайомитися з правилами для авторів ↗</a>
          </div>
        </div>
      )}

      {ungroupedCount > 0 && (
        <div className="jrs-issues-ungrouped">
          <div>
            <strong>Публікації поза нумерованими випусками</strong>
            <p>{ungroupedCount} матеріалів уже опубліковано без повного набору реквізитів тому й номера. Вони залишаються доступними в загальному каталозі.</p>
          </div>
          <a href="/publications">До всіх публікацій ↗</a>
        </div>
      )}

      <div className="jrs-issues-editorial-note">
        <span aria-hidden="true">✳</span>
        <div>
          <strong>Як формується цей архів</strong>
          <p>Архів об’єднує лише опубліковані статті з указаними редакцією томом і номером. Дата останньої статті не є датою офіційного виходу випуску. Відображення матеріалу в архіві не підтверджує наявність ISSN, DOI чи статусу фахового видання.</p>
        </div>
      </div>
    </JournalInfoLayout>
  );
}

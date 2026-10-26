import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import IssueCover from "@/app/components/IssueCover";
import BookmarkButton from "@/app/components/BookmarkButton";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { groupPublishedIssues, issueHref, parseIssueKey } from "@/app/lib/jrs-issues";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  if (!parseIssueKey(key)) return { title: "Випуск не знайдено | JRS" };
  const issue = groupPublishedIssues(await allPublications()).find(item => item.key === key);
  if (!issue) return { title: "Випуск не знайдено | JRS" };
  return {
    title: `Том ${issue.volume}, випуск ${issue.number} | Journal of Renal Science`,
    description: `Зміст тому ${issue.volume}, випуску ${issue.number} Journal of Renal Science: ${issue.articles.length} опублікованих наукових матеріалів.`,
    alternates: { canonical: issueHref(issue.key) },
  };
}

export default async function IssueDetailPage({ params }: Props) {
  const { key } = await params;
  if (!parseIssueKey(key)) notFound();
  const issue = groupPublishedIssues(await allPublications()).find(item => item.key === key);
  if (!issue) notFound();

  return (
    <JournalInfoLayout
      eyebrow={`Том ${issue.volume} · Випуск ${issue.number}`}
      title={`Том ${issue.volume}. Випуск ${issue.number}.`}
      description={`Зміст наукових публікацій JRS: ${issue.articles.length} матеріалів із зазначеними редакцією даними тому й номера.`}
      sections={[]}
      wide
    >
      <p className="pub-back"><a href="/issues">← До архіву випусків</a></p>
      <div className="jrs-issue-detail-intro">
        <div className="jrs-issue-detail-cover">
          <IssueCover volume={issue.volume} number={issue.number}
            year={issue.latestArticleDate.slice(0,4)} size="large"/>
        </div>
        <div className="jrs-issue-detail-lead">
          <p className="jrs-issues-eyebrow">THE TABLE OF CONTENTS</p>
          <h2>Дослідження, що складають цей випуск.</h2>
          <p>На цій сторінці зібрано опубліковані статті, для яких редакція вказала однакові реквізити тому й номера. Кожну роботу можна відкрити окремо, прочитати анотацію та отримати PDF за наявності.</p>
          <div className="jrs-issue-detail-summary">
            <span><strong>{issue.articles.length}</strong> матеріалів</span>
            <span><strong>{formatPublicationDate(issue.latestArticleDate)}</strong> найновіша стаття</span>
          </div>
        </div>
      </div>
      <section className="jrs-issue-contents" aria-labelledby="jrs-issue-contents-title">
        <div className="jrs-issues-section-head">
          <p className="jrs-issues-eyebrow">ISSUE CONTENTS</p>
          <h2 id="jrs-issue-contents-title">Зміст випуску</h2>
        </div>
        <div className="jrs-issue-contents-list">
          {issue.articles.map((article, index) => (
            <article key={article.slug} className="jrs-issue-contents-item">
              <span className="jrs-issue-contents-index">{String(index + 1).padStart(2,"0")}</span>
              <div>
                <div className="jrs-issue-contents-meta">
                  <span>{publicationTypeLabels[article.type]}</span>
                  <time dateTime={article.publishedAt}>{formatPublicationDate(article.publishedAt)}</time>
                  {article.pages && <span>С. {article.pages}</span>}
                </div>
                <h3><a href={`/publications/${article.slug}`}>{article.title}</a></h3>
                <p>{article.authors.map(author => author.name).join(", ")}</p>
                <div className="jrs-issue-contents-actions">
                  <a href={`/publications/${article.slug}`}>Сторінка статті ↗</a>
                  {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">PDF ↗</a>}
                  <BookmarkButton slug={article.slug} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="jrs-issues-editorial-note">
        <span aria-hidden="true">✳</span>
        <div>
          <strong>Достовірні бібліографічні відомості</strong>
          <p>Групування виконується за томом і номером, внесеними редакцією до опублікованих статей. Указана дата стосується найновішої статті, а не є окремо засвідченою датою виходу випуску. Наявність цього архіву не означає автоматичного отримання ISSN чи індексації.</p>
        </div>
      </div>
    </JournalInfoLayout>
  );
}

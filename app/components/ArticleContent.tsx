import type { Publication } from "@/app/lib/publications";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import ArticleLanguageView from "@/app/components/ArticleLanguageView";
import CitationTools from "@/app/components/CitationTools";
import BookmarkButton from "@/app/components/BookmarkButton";

type Props = { article: Publication; draft?: boolean; pdfUrl?: string };

export const articleSectionLinks = (hasPdf: boolean, draft = false, hasReferences = false) => [
  { href: "#abstract", label: "Анотація / Abstract" },
  { href: "#keywords", label: "Ключові слова" },
  { href: "#authors", label: "Автори" },
  ...(!draft ? [{ href: "#citation", label: "Цитування" }] : []),
  ...(hasReferences ? [{ href: "#references", label: "Література" }] : []),
  ...(hasPdf ? [{ href: "#pdf", label: "Повний текст PDF" }] : []),
];

export default function ArticleContent({ article, draft = false, pdfUrl }: Props) {
  const file = pdfUrl ?? article.pdfUrl;
  return (
    <div className="jrs-article-body">
      {draft && (
        <div className="pub-preview-banner" role="status">
          <strong>Приватний попередній перегляд</strong>
          <p>Чернетка ще недоступна читачам. Переклад і список джерел доступні лише у збереженому вигляді.</p>
        </div>
      )}
      <div className="jrs-article-actions">
        <p className="pub-article-type">{publicationTypeLabels[article.type]}</p>
        {!draft && <BookmarkButton slug={article.slug} />}
      </div>
      <ArticleLanguageView article={article} />
      <section id="authors">
        <h2>Автори</h2>
        <ul className="pub-author-list">
          {article.authors.map((author, index) => (
            <li key={`${author.name}-${index}`}>
              <strong>{author.name}</strong>
              {author.affiliation && <span>{author.affiliation}</span>}
              {author.orcid && (
                <a href={`https://orcid.org/${author.orcid}`} target="_blank" rel="noopener noreferrer">
                  ORCID: {author.orcid} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
      {!draft && (
        <section id="citation">
          <h2>Як цитувати статтю</h2>
          <CitationTools article={article} />
          <dl className="pub-citation">
            <div><dt>Дата публікації</dt><dd><time dateTime={article.publishedAt}>{formatPublicationDate(article.publishedAt)}</time></dd></div>
            <div><dt>Тип матеріалу</dt><dd>{publicationTypeLabels[article.type]}</dd></div>
            <div><dt>Оригінальна мова</dt><dd>{article.language === "uk" ? "Українська" : "Англійська"}</dd></div>
            {article.volume && <div><dt>Том</dt><dd>{article.volume}</dd></div>}
            {article.issue && <div><dt>Випуск</dt><dd>{article.issue}</dd></div>}
            {article.pages && <div><dt>Сторінки</dt><dd>{article.pages}</dd></div>}
            {article.doi && <div><dt>DOI</dt><dd><a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer">{article.doi} ↗</a></dd></div>}
            <div><dt>Видання</dt><dd>Journal of Renal Science — незалежний науково-інформаційний журнал</dd></div>
          </dl>
        </section>
      )}
      {Boolean(article.references?.length) && (
        <section id="references">
          <h2>Список літератури</h2>
          <ol className="jrs-reference-list">
            {article.references?.map((source, index) => <li key={index}>{source}</li>)}
          </ol>
        </section>
      )}
      {file && (
        <section id="pdf">
          <h2>Повний текст</h2>
          <p>{draft ? "PDF доступний тільки редактору." : "Доступний PDF-файл статті."}</p>
          <a className="pub-download" href={file} target="_blank" rel="noopener noreferrer">
            {draft ? "Переглянути приватний PDF ↗" : "Відкрити PDF статті ↗"}
          </a>
        </section>
      )}
      {!draft && <p className="pub-final-note">Публікація відображає результати та висновки її авторів. Медичні рішення потребують індивідуальної клінічної оцінки.</p>}
    </div>
  );
}

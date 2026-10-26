import type { Publication } from "@/app/lib/publications";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import CitationTools from "@/app/components/CitationTools";

type Props = {
  article: Publication;
  draft?: boolean;
  pdfUrl?: string;
};

export const articleSectionLinks = (hasPdf: boolean, draft = false) => [
  { href: "#abstract", label: "Анотація" },
  { href: "#authors", label: "Автори" },
  { href: "#keywords", label: "Ключові слова" },
  ...(!draft ? [{ href: "#citation", label: "Цитування" }] : []),
  ...(hasPdf ? [{ href: "#pdf", label: "Повний текст PDF" }] : []),
];

export default function ArticleContent({ article, draft = false, pdfUrl }: Props) {
  const url = `https://journal.kidney.pp.ua/publications/${article.slug}`;
  const file = pdfUrl ?? article.pdfUrl;
  const year = article.publishedAt.slice(0, 4);
  const citation = [
    article.authors.map(author => author.name).join(", ") + ".",
    article.title + ".",
    "Journal of Renal Science.",
    year + ".",
    url,
  ].join(" ");

  return (
    <div className="jrs-article-body">
      {draft ? (
        <div className="pub-preview-banner" role="status">
          <strong>Приватний попередній перегляд</strong>
          <p>Так виглядатиме стаття для читачів після публікації. Чернетка ще не доступна публічно.</p>
        </div>
      ) : null}
      <section id="abstract">
        <p className="pub-article-type">{publicationTypeLabels[article.type]}</p>
        <h2>Анотація</h2>
        <p className="pub-article-abstract">{article.abstract}</p>
      </section>
      <section id="authors">
        <h2>Автори</h2>
        <ul className="pub-author-list">
          {article.authors.map((author, index) => (
            <li key={`${author.name}-${index}`}>
              <strong>{author.name}</strong>
              {author.affiliation ? <span>{author.affiliation}</span> : null}
              {author.orcid ? (
                <a href={`https://orcid.org/${author.orcid}`} target="_blank" rel="noopener noreferrer">
                  ORCID: {author.orcid} ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section id="keywords">
        <h2>Ключові слова</h2>
        <div className="pub-keywords">
          {article.keywords.map((keyword, index) => <span key={`${keyword}-${index}`}>{keyword}</span>)}
        </div>
      </section>
      {!draft ? (
        <section id="citation">
          <h2>Як цитувати статтю</h2>
          <p className="pub-citation-example">{citation}</p>
          <CitationTools citation={citation} url={url} />
          <p className="pub-source-note">
            Це бібліографічне посилання містить лише підтверджені відомості.
            DOI, номер випуску та сторінки не додаються без їх фактичного присвоєння.
          </p>
          <dl className="pub-citation">
            <div><dt>Дата публікації</dt><dd><time dateTime={article.publishedAt}>{formatPublicationDate(article.publishedAt)}</time></dd></div>
            <div><dt>Тип матеріалу</dt><dd>{publicationTypeLabels[article.type]}</dd></div>
            <div><dt>Мова</dt><dd>{article.language === "uk" ? "Українська" : "Англійська"}</dd></div>
            {article.volume ? <div><dt>Том</dt><dd>{article.volume}</dd></div> : null}
            {article.issue ? <div><dt>Випуск</dt><dd>{article.issue}</dd></div> : null}
            {article.pages ? <div><dt>Сторінки</dt><dd>{article.pages}</dd></div> : null}
            {article.doi ? <div><dt>DOI</dt><dd><a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer">{article.doi} ↗</a></dd></div> : null}
            <div><dt>Видання</dt><dd>Journal of Renal Science — незалежний науково-інформаційний журнал</dd></div>
          </dl>
        </section>
      ) : null}
      {file ? (
        <section id="pdf">
          <h2>Повний текст</h2>
          <p>{draft ? "PDF доступний тільки вам як редактору." : "Доступний PDF-файл статті."}</p>
          <a className="pub-download" href={file} target="_blank" rel="noopener noreferrer">
            {draft ? "Переглянути приватний PDF ↗" : "Відкрити PDF статті ↗"}
          </a>
        </section>
      ) : null}
      {!draft ? (
        <p className="pub-final-note">Публікація відображає результати та висновки її авторів. Медичні рішення потребують індивідуальної клінічної оцінки.</p>
      ) : null}
    </div>
  );
}

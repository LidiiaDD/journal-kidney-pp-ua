import type { ArticleTransparency, Publication } from "@/app/lib/publications";
import type { JrsNotice } from "@/app/lib/jrs-notices";
import { strongestNotice, noticeUrl } from "@/app/lib/jrs-notices";
import { articleUrl } from "@/app/lib/citations";
import { englishArticleView } from "@/app/lib/jrs-english-article";
import EnglishCitationTools from "@/app/components/EnglishCitationTools";
import BookmarkButton from "@/app/components/BookmarkButton";

const kindLabels: Record<Publication["type"], string> = {
  "original-research": "Original research",
  review: "Review",
  "case-report": "Clinical case report",
  "brief-report": "Brief communication",
  perspective: "Perspective",
};

const declarations: { title: string; key: keyof ArticleTransparency }[] = [
  { title: "Ethics approval or exemption", key: "ethicsStatement" },
  { title: "Informed consent", key: "consentStatement" },
  { title: "Funding", key: "fundingStatement" },
  { title: "Competing interests", key: "competingInterests" },
  { title: "Data availability", key: "dataAvailability" },
  { title: "Author contributions", key: "authorContributions" },
  { title: "Use of AI", key: "aiDisclosure" },
];

const englishNoticeLabels: Record<JrsNotice["kind"], string> = {
  correction: "Correction",
  concern: "Expression of concern",
  retraction: "Retraction",
};

function englishDate(iso: string): string {
  const value = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(value.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
  }).format(value);
}

export default function EnglishArticleContent({ article, notices }: { article: Publication; notices: JrsNotice[] }) {
  const display = englishArticleView(article);
  const transparency = article.transparency;
  const noticeStatus = strongestNotice(notices);
  const critical = noticeStatus === "retraction" || noticeStatus === "concern";
  const explicitReview = transparency?.reviewKind === "external" && Boolean(transparency.reviewDetails?.trim());

  return (
    <div className="wrap jrs-en-article">
      <nav className="jrs-en-article-breadcrumb" aria-label="Article breadcrumb">
        <a href="/en/publications">← Back to research catalogue</a>
        <a href={articleUrl(article)} lang="uk" hrefLang="uk">Original article page ↗</a>
      </nav>

      {notices.length > 0 && (
        <section className={`jrs-en-article-notice${critical ? " is-urgent" : ""}`}
          aria-labelledby="jrs-en-article-notice-title">
          <span className="jrs-en-article-notice-icon" aria-hidden="true">!</span>
          <div>
            <span className="jrs-en-eyebrow">IMPORTANT / POST-PUBLICATION RECORD</span>
            <h2 id="jrs-en-article-notice-title">{noticeStatus === "retraction"
              ? "This article has been retracted."
              : noticeStatus === "concern"
                ? "An expression of concern has been issued for this article."
                : "This article has a published correction."}</h2>
            <p>{noticeStatus === "retraction"
              ? "Do not rely on the paper's conclusions without consulting the official retraction notice."
              : noticeStatus === "concern"
                ? "Questions have been raised about this work. Review the editorial notice before using or citing its findings."
                : "A correction has been published. Consult the editorial record before citing the work."}</p>
            <ol>
              {notices.map(notice => (
                <li key={notice.id}>
                  <strong>{englishNoticeLabels[notice.kind]}</strong>
                  <time dateTime={notice.issued_at}>{englishDate(notice.issued_at)}</time>
                  <a href={noticeUrl(notice.id)}>Read official notice ↗</a>
                </li>
              ))}
            </ol>
            <small>Official notices retain their original published language and are linked to their dated records.</small>
          </div>
        </section>
      )}

      {!display.englishAvailable && (
        <div className="jrs-en-article-language-warning" role="note">
          <strong>English article metadata is not available.</strong>
          <p>The interface below is in English, but the article title, abstract and keywords remain in their original language. They have not been machine-translated or rewritten.</p>
        </div>
      )}
      {display.translated && (
        <div className="jrs-en-article-language-note">
          <strong>English-language metadata</strong>
          <p>The English title, abstract and keywords were supplied as publication metadata. The full article or PDF may still be in its original language.</p>
        </div>
      )}

      <div className="jrs-en-article-shortcuts" aria-label="Article sections">
        <a href="#abstract">Abstract</a>
        <a href="#authors">Authors</a>
        <a href="#integrity">Research integrity</a>
        <a href="#citation">Citation</a>
        {article.references?.length ? <a href="#references">References</a> : null}
        {article.pdfUrl ? <a href="#full-text">PDF</a> : null}
      </div>

      <div className="jrs-en-article-layout">
        <div className="jrs-en-article-main">
          <section id="abstract" className="jrs-en-article-section">
            <span className="jrs-en-eyebrow">01 / {display.englishAvailable ? "ABSTRACT" : "ORIGINAL-LANGUAGE ABSTRACT"}</span>
            <h2>Abstract</h2>
            <p lang={display.language} className="jrs-en-article-abstract">{display.metadata.abstract}</p>
            <h3>Keywords</h3>
            <div className="jrs-en-article-keywords" lang={display.language}>
              {display.metadata.keywords.map(keyword => <span key={keyword}>{keyword}</span>)}
            </div>
          </section>

          <section id="authors" className="jrs-en-article-section">
            <span className="jrs-en-eyebrow">02 / CONTRIBUTORS</span>
            <h2>Authors and affiliations</h2>
            <ul className="jrs-en-article-author-list">
              {article.authors.map((author,index) => {
                const orcid = author.orcid?.replace(/^https?:\/\/orcid\.org\//i, "");
                const hasOrcid = orcid && /^(?:\d{4}-){3}\d{3}[\dX]$/.test(orcid);
                return (
                  <li key={`${author.name}-${index}`}>
                    <strong>{author.name}</strong>
                    {author.affiliation && <span>{author.affiliation}</span>}
                    {hasOrcid && <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noopener noreferrer">ORCID: {orcid} ↗</a>}
                  </li>
                );
              })}
            </ul>
          </section>

          <section id="integrity" className="jrs-en-article-section">
            <span className="jrs-en-eyebrow">03 / RESEARCH INTEGRITY</span>
            <h2>Transparency statement</h2>
            <div className="jrs-en-review-status">
              <strong>{explicitReview ? "Documented external peer review" : transparency?.reviewKind === "editorial"
                ? "Editorial assessment" : "Review process not specified"}</strong>
              <p>{explicitReview
                ? "The editorial record indicates that external independent review was completed. The process is described below."
                : transparency?.reviewKind === "editorial"
                  ? "Editorial assessment should not be described as independent external peer review."
                  : "No definitive review-process declaration is available for this article."}</p>
              {transparency?.reviewDetails?.trim() && <p className="jrs-en-statement-source">{transparency.reviewDetails}</p>}
            </div>
            <div className="jrs-en-integrity-grid">
              {declarations.map(item => {
                const value = transparency?.[item.key];
                return (
                  <div key={item.key} className="jrs-en-integrity-cell">
                    <h3>{item.title}</h3>
                    {value?.trim()
                      ? <p className="jrs-en-statement-source">{value}</p>
                      : <p className="jrs-en-not-reported">Not reported</p>}
                  </div>
                );
              })}
            </div>
            <p className="jrs-en-integrity-disclaimer">Statements reflect information supplied to the editorial office. Their presence alone does not prove independent verification or scientific quality. “Not reported” does not mean “none” or “not applicable.” Statements may be in their original language.</p>
          </section>

          <section id="citation" className="jrs-en-article-section">
            <span className="jrs-en-eyebrow">04 / CITATION & EXPORT</span>
            <h2>How to cite this article</h2>
            <EnglishCitationTools article={article}/>
          </section>

          {Boolean(article.references?.length) && (
            <section id="references" className="jrs-en-article-section">
              <span className="jrs-en-eyebrow">05 / BIBLIOGRAPHY</span>
              <h2>References</h2>
              <ol className="jrs-en-reference-list">
                {article.references?.map((entry,index) => <li key={index}>{entry}</li>)}
              </ol>
              <p className="jrs-en-integrity-disclaimer">Bibliographic entries are reproduced as provided in the published record; they are not translated automatically.</p>
            </section>
          )}

          {article.pdfUrl && (
            <section id="full-text" className="jrs-en-article-section">
              <span className="jrs-en-eyebrow">FULL TEXT / PDF</span>
              <h2>Read the full article</h2>
              <p>Open the published PDF. The document may be in a different language from the interface shown here.</p>
              <a className="jrs-en-pdf-button" href={article.pdfUrl} target="_blank" rel="noopener noreferrer">Open published PDF ↗</a>
            </section>
          )}
        </div>

        <aside className="jrs-en-article-sidebar" aria-label="Bibliographic article details">
          <span className="jrs-en-eyebrow">JRS / ARTICLE RECORD</span>
          <h2>Publication details</h2>
          <dl>
            <div><dt>Published</dt><dd><time dateTime={article.publishedAt}>{englishDate(article.publishedAt)}</time></dd></div>
            <div><dt>Article type</dt><dd>{kindLabels[article.type]}</dd></div>
            <div><dt>Original language</dt><dd>{article.language === "uk" ? "Ukrainian" : "English"}</dd></div>
            {article.volume && <div><dt>Volume</dt><dd>{article.volume}</dd></div>}
            {article.issue && <div><dt>Issue</dt><dd>{article.issue}</dd></div>}
            {article.pages && <div><dt>Pages</dt><dd>{article.pages}</dd></div>}
            {article.doi && <div><dt>DOI</dt><dd><a href={`https://doi.org/${encodeURI(article.doi)}`} target="_blank" rel="noopener noreferrer">{article.doi} ↗</a></dd></div>}
            <div><dt>Journal</dt><dd>Journal of Renal Science</dd></div>
          </dl>
          <div className="jrs-en-article-sidebar-actions">
            <BookmarkButton slug={article.slug} locale="en" />
            <a href={articleUrl(article)} lang="uk" hrefLang="uk">View primary publication record ↗</a>
          </div>
          <p>Independent scientific-information online journal. Journal status, indexing and review claims are documented separately.</p>
        </aside>
      </div>
      <div className="jrs-en-article-endnote">
        <span aria-hidden="true">✳</span>
        <p>Research findings and conclusions remain the authors' responsibility. Clinical care decisions require patient-specific professional assessment. Any corrections or retractions should be reviewed before citing findings.</p>
      </div>
    </div>
  );
}

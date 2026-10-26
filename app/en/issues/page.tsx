import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import IssueCover from "@/app/components/IssueCover";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { groupPublishedIssues } from "@/app/lib/jrs-issues";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Issues Archive | Journal of Renal Science",
  description: "Explore the genuine published issues of Journal of Renal Science: volume and issue metadata, scientific covers, tables of contents and research articles.",
  alternates: { canonical: "/en/issues", languages: { en: "/en/issues", uk: "/issues" } },
};

export default async function EnglishIssuesArchive() {
  const publications = await allPublications();
  const issues = groupPublishedIssues(publications);
  const included = new Set(issues.flatMap(issue => issue.articles.map(article => article.slug)));
  const unassigned = publications.filter(article => !included.has(article.slug)).length;
  const latest = issues[0];

  return (
    <InternationalLayout
      eyebrow="RESEARCH ARCHIVE / VOLUMES & ISSUES"
      title="Research, collected with purpose."
      lead="A visual archive of JRS research collections. Issues are listed only when publicly released articles carry confirmed volume and issue metadata."
    >
      <div className="wrap jrs-en-issues-page">
        <div className="jrs-en-issues-intro">
          <div>
            <span className="jrs-en-eyebrow">JRS / PUBLISHED RESEARCH COLLECTIONS</span>
            <h2>Every article has a story. Every issue has a record.</h2>
            <p>Browse genuine volumes and issues derived from the journal's released research. Covers are visual representations; they do not establish a separate publication date or official accreditation.</p>
          </div>
          <div className="jrs-en-issues-summary" aria-label="Published archive totals">
            <strong>{issues.length}</strong>
            <span>issues with published work</span>
            <i aria-hidden="true" />
            <strong>{publications.length}</strong>
            <span>publicly released articles</span>
          </div>
        </div>

        {latest ? (
          <>
            <section className="jrs-en-issues-featured" aria-labelledby="jrs-en-latest-issue-heading">
              <div className="jrs-en-issues-featured-cover">
                <a href={`/en/issues/${latest.key}`} aria-label={`View volume ${latest.volume}, issue ${latest.number}`}>
                  <IssueCover volume={latest.volume} number={latest.number} year={latest.latestArticleDate.slice(0,4)} size="large" locale="en" />
                </a>
              </div>
              <div className="jrs-en-issues-featured-copy">
                <span className="jrs-en-eyebrow">MOST RECENT REPRESENTED ISSUE</span>
                <h2 id="jrs-en-latest-issue-heading">Volume {latest.volume}. <em>Issue {latest.number}.</em></h2>
                <p>This collection contains actual JRS articles with matching editor-entered volume and issue identifiers. Each article retains its own public bibliographic record and publication date.</p>
                <div className="jrs-en-issues-featured-facts">
                  <div><strong>{latest.articles.length}</strong><span>articles in issue</span></div>
                  <div><strong>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(latest.latestArticleDate + "T00:00:00Z"))}</strong><span>most recent article date</span></div>
                </div>
                <a className="jrs-en-issues-primary-action" href={`/en/issues/${latest.key}`}>Open table of contents ↗</a>
              </div>
            </section>

            {issues.length > 1 && (
              <section className="jrs-en-issues-all" aria-labelledby="jrs-en-all-issues-heading">
                <div className="jrs-en-issues-all-heading">
                  <span className="jrs-en-eyebrow">JRS / COMPLETE ISSUE ARCHIVE</span>
                  <h2 id="jrs-en-all-issues-heading">Earlier research collections.</h2>
                </div>
                <div className="jrs-en-issues-cards">
                  {issues.slice(1).map((issue, index) => (
                    <a className="jrs-en-issues-card" key={issue.key} href={`/en/issues/${issue.key}`}>
                      <IssueCover volume={issue.volume} number={issue.number} year={issue.latestArticleDate.slice(0,4)} variant={index + 1} locale="en" />
                      <span><strong>Volume {issue.volume} · Issue {issue.number}</strong><small>{issue.articles.length} {issue.articles.length === 1 ? "article" : "articles"} · View contents ↗</small></span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="jrs-en-issues-upcoming">
            <div className="jrs-en-issues-upcoming-art">
              <IssueCover upcoming size="large" locale="en" />
            </div>
            <div>
              <span className="jrs-en-eyebrow">CURRENT STATUS / ARCHIVE IN PREPARATION</span>
              <h2>The first published issue <em>is still ahead.</em></h2>
              <p>No issues currently contain publicly released JRS articles with confirmed volume and issue information. The illustrative cover is clearly marked as unannounced and does not represent a published issue.</p>
              <p>Once editors publish research with complete issue identifiers, the cover and table of contents will appear here automatically.</p>
              <a className="jrs-en-issues-primary-action" href="/en/authors">Read the author guidelines ↗</a>
            </div>
          </div>
        )}

        {unassigned > 0 && (
          <div className="jrs-en-issues-unassigned">
            <div>
              <strong>Published articles without an assigned issue</strong>
              <p>{unassigned} {unassigned === 1 ? "article is" : "articles are"} public but not currently associated with complete volume and issue information. These papers remain available in the journal's general research catalogue.</p>
            </div>
            <a href="/en/publications">View all research ↗</a>
          </div>
        )}
        <div className="jrs-en-issues-integrity">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>How this archive is compiled</strong>
            <p>Only already published articles with both volume and issue identifiers are grouped. The displayed “most recent article date” is not presented as the official release date of the entire issue. An issue cover is generated as part of the website's visual design, not evidence of an ISSN, DOI, index listing or accredited journal status.</p>
            <p><a href="/en/publications">Public research catalogue ↗</a> · <a href="/en/policy">Editorial principles ↗</a></p>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

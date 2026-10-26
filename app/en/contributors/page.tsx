import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import EnglishContributorDirectory from "@/app/components/EnglishContributorDirectory";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { authorEntries } from "@/app/lib/jrs-contributors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Contributors | Journal of Renal Science",
  description: "Browse bibliographic contributor records from published JRS nephrology research, including names, affiliated institutions, ORCID where supplied and linked scientific publications.",
  alternates: { canonical: "/en/contributors", languages: { en: "/en/contributors", uk: "/contributors" } },
};

export default async function EnglishContributorsPage() {
  const articles = await allPublications();
  const contributors = authorEntries(articles);
  const cards = contributors.map(author => ({
    key: author.key,
    name: author.name,
    initial: author.initial,
    affiliation: author.affiliations[0] || "",
    orcid: author.orcid,
    publicationCount: author.articles.length,
  }));

  return (
    <InternationalLayout
      eyebrow="RESEARCH COMMUNITY / CONTRIBUTORS"
      title="Meet the names behind the research."
      lead="Explore a bibliographic index of contributors appearing in publicly released JRS articles. Search authors, institutions and ORCID identifiers as supplied with the publications."
    >
      <div className="wrap jrs-en-contrib-page">
        <div className="jrs-en-contrib-intro">
          <div>
            <span className="jrs-en-eyebrow">JRS / SCHOLARLY CONTRIBUTORS</span>
            <h2>Research is written by people.</h2>
            <p>The directory grows with actual publications, connecting each listed contributor to the articles in which their name appears. It is not a database of verified personal identities.</p>
          </div>
          <div className="jrs-en-contrib-overview" aria-label="Bibliographic directory totals">
            <strong>{contributors.length}</strong><span>contributor records</span>
            <i aria-hidden="true"/>
            <strong>{articles.length}</strong><span>published articles</span>
          </div>
        </div>
        <EnglishContributorDirectory entries={cards} />
        <div className="jrs-en-contrib-integrity">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Bibliographic records, not verified personal profiles</strong>
            <p>Names and affiliations are reproduced from actual published articles. The journal groups records by a valid ORCID checksum or by identical normalized names and affiliations when no ORCID is supplied. This does not independently verify ownership of an ORCID, nor does it guarantee that two people sharing a name are the same individual. One author may also appear in more than one record.</p>
            <p><a href="/en/publications">Browse the research catalogue ↗</a> · <a href="/en/authors">Information for authors ↗</a></p>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

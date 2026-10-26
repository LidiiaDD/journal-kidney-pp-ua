import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import EnglishPublicationExplorer from "@/app/components/EnglishPublicationExplorer";
import { allPublications } from "@/app/lib/jrs-catalogue";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Publications (English) | Journal of Renal Science",
  description: "Browse published JRS nephrology research with English-language metadata where available. Search real scientific articles by title, author and keywords.",
  alternates: { canonical: "/en/publications", languages: { en: "/en/publications", uk: "/publications" } },
};

export default async function EnglishPublicationsPage() {
  const articles = await allPublications();
  return (
    <InternationalLayout
      eyebrow="RESEARCH / PUBLICATIONS"
      title="Published research. Open to discovery."
      lead="Browse publicly released JRS articles, search by title or author, and view English metadata where it has been supplied. Unpublished manuscripts never appear here."
    >
      <div className="wrap jrs-en-publications-page">
        <div className="jrs-en-publications-top">
          <div><span className="jrs-en-eyebrow">THE PUBLIC RESEARCH CATALOGUE</span><h2>Evidence begins with the published record.</h2><p>English titles, abstracts and keywords appear only if they were supplied for the publication. If they are unavailable, the original text is shown and clearly marked.</p></div>
          <div className="jrs-en-publications-count"><strong>{articles.length}</strong><span>released articles</span></div>
        </div>
        <EnglishPublicationExplorer items={articles}/>
        <div className="jrs-en-catalogue-note">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Read beyond the language label.</strong>
            <p>Article pages may also contain Ukrainian-language interface elements. Individual publications display their genuine bibliographic metadata and declared review status. A link to an article is not an endorsement or a claim that external peer review was completed.</p>
            <a href="/en/policy">Our editorial approach ↗</a>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

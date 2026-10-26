import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import EnglishPublicationExplorer from "@/app/components/EnglishPublicationExplorer";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { isTopicSlug } from "@/app/lib/research-topics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Publications (English) | Journal of Renal Science",
  description: "Browse published JRS nephrology research with English-language metadata where available. Search real scientific articles by title, author and keywords.",
  alternates: { canonical: "/en/publications", languages: { en: "/en/publications", uk: "/publications" } },
};

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function EnglishPublicationsPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  const selectedTopic = topic && isTopicSlug(topic) ? topic : "all";
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
        <div className="jrs-en-atlas-bridge">
          <div>
            <span className="jrs-en-eyebrow">EXPLORE BY FIELD</span>
            <p>Prefer to browse by clinical interest? Open the eight-field Research Atlas.</p>
          </div>
          <a href="/en/topics">Open Research Atlas ↗</a>
        </div>
        <EnglishPublicationExplorer key={selectedTopic} items={articles} initialTopic={selectedTopic}/>
        <div className="jrs-en-issue-catalogue-bridge">
          <span className="jrs-en-eyebrow">BROWSE BY VOLUME</span>
          <p>Looking for a complete research collection rather than an individual article? Browse the issue archive.</p>
          <a href="/en/issues">Open issues archive ↗</a>
        </div>
        <div className="jrs-en-catalogue-note">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Read beyond the language label.</strong>
            <p>Individual articles now have an English-language reading interface with source-language notices and declarations clearly identified. English abstracts appear only when approved metadata exists; the full PDF may remain in the original language. A link does not imply that independent peer review was completed.</p>
            <a href="/en/policy">Our editorial approach ↗</a>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

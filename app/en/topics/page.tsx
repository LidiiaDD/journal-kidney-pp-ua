import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { researchTopics, topicCounts, type TopicSlug } from "@/app/lib/research-topics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Atlas | Journal of Renal Science",
  description: "Explore eight areas of nephrology research in JRS. Live publication counts and links to actual published articles on chronic kidney disease, dialysis, biomarkers and more.",
  alternates: { canonical: "/en/topics", languages: { en: "/en/topics", uk: "/topics" } },
};

const descriptions: Record<TopicSlug, { subtitle: string; summary: string; terms: string }> = {
  ckd: {
    subtitle: "CHRONIC KIDNEY DISEASE",
    summary: "Progression, comorbidity, nephroprotection, kidney function and long-term clinical outcomes.",
    terms: "CKD / eGFR / CLINICAL RISK",
  },
  aki: {
    subtitle: "ACUTE KIDNEY INJURY",
    summary: "Acute renal dysfunction, critical-care settings, clinical outcomes and functional recovery.",
    terms: "AKI / CRITICAL CARE / RECOVERY",
  },
  dialysis: {
    subtitle: "KIDNEY REPLACEMENT",
    summary: "Hemodialysis, peritoneal dialysis, replacement therapies and patient-centered care.",
    terms: "HEMODIALYSIS / PD / KRT",
  },
  transplant: {
    subtitle: "KIDNEY TRANSPLANTATION",
    summary: "Recipient management, graft outcomes, transplantation science and immunosuppression.",
    terms: "GRAFT / RECIPIENT / FOLLOW-UP",
  },
  biomarkers: {
    subtitle: "BIOMARKERS & TRANSLATION",
    summary: "Uromodulin, molecular indicators, laboratory methods and emerging prognostic approaches.",
    terms: "UROMODULIN / LAB / MOLECULAR",
  },
  imaging: {
    subtitle: "IMAGING & DIAGNOSTICS",
    summary: "Ultrasound, imaging methods, renal structure and evidence-based diagnostic screening.",
    terms: "ULTRASOUND / IMAGING / SCREENING",
  },
  cases: {
    subtitle: "CLINICAL CASE REPORTS",
    summary: "Documented clinical observations, diagnostic challenges and practical insights.",
    terms: "CASE REPORT / OBSERVATION",
  },
  other: {
    subtitle: "FURTHER RENAL RESEARCH",
    summary: "Interdisciplinary work and related scientific questions beyond the primary categories.",
    terms: "INTERDISCIPLINARY / PERSPECTIVES",
  },
};

export default async function EnglishResearchAtlasPage() {
  const publications = await allPublications();
  const counts = topicCounts(publications);

  return (
    <InternationalLayout
      eyebrow="RESEARCH ATLAS / JOURNAL TOPICS"
      title="Navigate the science of kidney health."
      lead="Eight pathways through the journal’s actual research archive. Explore a subject area to find publicly released articles; each topic grows as the journal publishes new work."
    >
      <div className="wrap jrs-en-atlas-page">
        <div className="jrs-en-atlas-intro">
          <div>
            <span className="jrs-en-eyebrow">JRS / A MAP OF RESEARCH</span>
            <h2>Every question opens a new direction.</h2>
            <p>From clinical decision-making to translational science, the atlas groups published research by subject so readers can find relevant work without searching from scratch.</p>
          </div>
          <div className="jrs-en-atlas-overview" aria-label="Published research overview">
            <strong>{publications.length.toLocaleString("en-GB")}</strong>
            <span>published articles</span>
            <i aria-hidden="true" />
            <strong>{researchTopics.length}</strong>
            <span>research areas</span>
          </div>
        </div>

        <div className="jrs-en-atlas-grid" aria-label="Nephrology research fields">
          {researchTopics.map(topic => {
            const info = descriptions[topic.slug];
            const count = counts[topic.slug];
            return (
              <a key={topic.slug}
                href={`/en/publications?topic=${encodeURIComponent(topic.slug)}`}
                className={`jrs-en-atlas-card jrs-en-atlas-card--${topic.slug}`}
                aria-label={`${topic.english}: ${count} published ${count === 1 ? "article" : "articles"}. Explore research.`}>
                <div className="jrs-en-atlas-card-top">
                  <span>JRS / FIELD {topic.code}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="jrs-en-atlas-card-art" aria-hidden="true">
                  <span className="orbit first" />
                  <span className="orbit second" />
                  <span className="core" />
                </div>
                <div className="jrs-en-atlas-card-content">
                  <span className="jrs-en-atlas-card-kicker">{info.subtitle}</span>
                  <h3>{topic.english}</h3>
                  <p>{info.summary}</p>
                </div>
                <div className="jrs-en-atlas-card-bottom">
                  <span>{info.terms}</span>
                  <strong>{count} {count === 1 ? "article" : "articles"}</strong>
                </div>
              </a>
            );
          })}
        </div>

        <div className="jrs-en-atlas-note">
          <span aria-hidden="true">✳</span>
          <div>
            <strong>Live discovery, not a scientific quality score</strong>
            <p>Articles are classified from actual published titles, keywords and declared article types. One paper may belong to several fields; articles without a clear match remain under “Further Renal Research.” The counts represent only publicly released work, not drafts, pending submissions or invented examples.</p>
          </div>
          <a href="/en/publications">Browse all research ↗</a>
        </div>
        <div className="jrs-en-atlas-contribute">
          <span className="jrs-en-eyebrow">CONTRIBUTE / JOURNAL OF RENAL SCIENCE</span>
          <h2>Your research may become part of this map.</h2>
          <p>Read the journal’s submission guidance, ethics requirements and editorial policies before sharing a manuscript.</p>
          <a href="/en/authors">Information for authors ↗</a>
        </div>
      </div>
    </InternationalLayout>
  );
}

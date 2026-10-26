import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";
import { allPublications } from "@/app/lib/jrs-catalogue";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "International Desk | Journal of Renal Science",
  description: "English-language overview of Journal of Renal Science, an independent online journal based in Ukraine: nephrology research, author guidance and editorial transparency.",
  alternates: { canonical: "/en", languages: { en: "/en", uk: "/" } },
  openGraph: { title: "Journal of Renal Science | International Desk", description: "Renal science. Clinical insight. Independent research dissemination.", locale: "en_US" },
};

const areas = [
  { num: "01", title: "Clinical nephrology", description: "Chronic kidney disease, acute kidney injury, clinical management, comorbidity and patient outcomes.", label: "CKD / AKI" },
  { num: "02", title: "Kidney replacement therapy", description: "Hemodialysis, peritoneal dialysis, renal replacement techniques and quality-of-care research.", label: "DIALYSIS / KRT" },
  { num: "03", title: "Transplantation", description: "Kidney transplantation, recipient care, long-term follow-up and transplant-related clinical questions.", label: "TRANSPLANT MEDICINE" },
  { num: "04", title: "Biomarkers and diagnostics", description: "Uromodulin, laboratory research, ultrasonography, imaging and translational approaches.", label: "LAB / IMAGING" },
];

export default async function EnglishHome() {
  const publications = await allPublications();
  const recent = publications.slice(0, 3);

  return (
    <InternationalLayout
      home
      eyebrow="INTERNATIONAL DESK / JOURNAL OF RENAL SCIENCE"
      title={<>Renal science. <em>Clinical insight.</em></>}
      lead="An independent scientific-information online journal for research and informed discussion in nephrology, kidney replacement therapy and related clinical disciplines."
    >
      <section className="jrs-en-facts">
        <div className="wrap jrs-en-facts-row">
          <div><strong>{publications.length}</strong><span>publicly released articles</span></div>
          <div><strong>UA / EN</strong><span>manuscripts considered in both languages</span></div>
          <div><strong>OPEN</strong><span>articles accessible without reader registration</span></div>
        </div>
      </section>

      <section className="wrap jrs-en-manifesto">
        <div><span className="jrs-en-eyebrow">01 / ABOUT THE JOURNAL</span><h2>Research belongs in the conversation.</h2></div>
        <div>
          <p>Journal of Renal Science (JRS) is an independent online scientific-information publication based in Ukraine. Its focus is the careful presentation and discussion of clinical and translational research relating to kidney health.</p>
          <p>The editorial approach emphasizes transparent methods, clear reporting, ethical handling of participant data and responsible interpretation of results. Editorial consideration must not be confused with independently completed external peer review.</p>
          <a href="/en/policy">Read the editorial approach ↗</a>
        </div>
      </section>

      <section className="jrs-en-fields" id="research-areas">
        <div className="wrap">
          <div className="jrs-en-section-head">
            <span className="jrs-en-eyebrow">02 / RESEARCH SCOPE</span>
            <h2>Four perspectives on kidney science.</h2>
            <p>From everyday clinical decisions to biomarker research.</p>
          </div>
          <div className="jrs-en-fields-link">
            <span>Explore all eight indexed research fields, linked to the current article catalogue.</span>
            <a href="/en/topics">Explore the Research Atlas ↗</a>
          </div>
          <div className="jrs-en-field-grid">
            {areas.map(area => (
              <article key={area.num} className="jrs-en-field-card">
                <span className="jrs-en-field-number">{area.num} / JRS</span>
                <div className="jrs-en-field-orbit" aria-hidden="true" />
                <span className="jrs-en-field-label">{area.label}</span>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap jrs-en-recent">
        <div className="jrs-en-recent-head">
          <div><span className="jrs-en-eyebrow">03 / PUBLISHED RESEARCH</span><h2>Read the work. Follow the evidence.</h2></div>
          <a href="/en/publications">Browse the full catalogue ↗</a>
        </div>
        {recent.length ? (
          <div className="jrs-en-recent-articles">
            {recent.map((article, index) => {
              const en = article.translations?.en;
              const title = article.language === "en" ? article.title : en?.title || article.title;
              const isEnglish = article.language === "en" || Boolean(en?.title);
              return (
                <a key={article.slug} href={`/en/publications/${article.slug}`} className="jrs-en-recent-entry">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>{isEnglish ? "English title available" : "Original-language title"} · {article.publishedAt}</small><h3 lang={isEnglish ? "en" : article.language}>{title}</h3><p>{article.authors.map(a => a.name).join(", ")}</p></div>
                  <b aria-hidden="true">↗</b>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="jrs-en-recent-empty">
            <span aria-hidden="true">✳</span>
            <div><h3>The publication archive is being prepared.</h3><p>No scientific articles are publicly released yet. This page will display real articles automatically as they are published.</p></div>
            <a href="/en/authors">For prospective authors ↗</a>
          </div>
        )}
      </section>

      <section className="wrap jrs-en-commitments">
        <div><span className="jrs-en-eyebrow">04 / EDITORIAL TRANSPARENCY</span><h2>Clear claims. <em>Accountable publishing.</em></h2></div>
        <div className="jrs-en-commitment-grid">
          <div><span>01</span><strong>Editorial status</strong><p>JRS is an independent scientific-information journal. It does not claim official Ukrainian professional-journal accreditation or indexing that has not been confirmed.</p></div>
          <div><span>02</span><strong>Publication metadata</strong><p>ISSN and DOI identifiers are presented only if genuinely obtained or assigned; they are not generated or implied by the website.</p></div>
          <div><span>03</span><strong>After publication</strong><p>Corrections, expressions of concern and retractions, if issued, remain linked to the scientific record through dated public notices.</p></div>
        </div>
        <a href="/en/policy">Editorial principles and publication status ↗</a>
      </section>

      <section className="jrs-en-notice-homeband">
        <div className="wrap jrs-en-notice-homeband-inner">
          <div aria-hidden="true" className="jrs-en-notice-homeband-mark">!</div>
          <div>
            <span className="jrs-en-eyebrow">PUBLICATION INTEGRITY / OFFICIAL RECORD</span>
            <h2>Corrections belong in plain sight.</h2>
            <p>The public notice register is where editors document genuine corrections, expressions of concern and retractions. Official statements are linked to the related article, with their wording preserved.</p>
          </div>
          <a href="/en/notices">Explore editorial notices ↗</a>
        </div>
      </section>

      <section className="jrs-en-author-invitation">
        <div className="wrap jrs-en-author-invitation-inner">
          <span className="jrs-en-eyebrow">CONTRIBUTE TO JRS</span>
          <h2>Have research worth sharing?</h2>
          <p>We provide clear submission guidance in English and Ukrainian, including manuscript structure, authorship, ethics and publication declarations.</p>
          <a href="/en/authors">Explore the author guidelines ↗</a>
        </div>
      </section>
    </InternationalLayout>
  );
}

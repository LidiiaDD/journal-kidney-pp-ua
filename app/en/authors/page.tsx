import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";

export const metadata: Metadata = {
  title: "Author Guidelines (English) | Journal of Renal Science",
  description: "English author guidance for Journal of Renal Science: research scope, manuscript structure, ethical requirements, disclosure and email submission.",
  alternates: { canonical: "/en/authors", languages: { en: "/en/authors", uk: "/authors" } },
};

const reportingGuides = [
  { title: "STROBE", detail: "Observational research", href: "https://www.equator-network.org/reporting-guidelines/strobe/" },
  { title: "PRISMA 2020", detail: "Systematic reviews", href: "https://www.prisma-statement.org/prisma-2020" },
  { title: "CARE", detail: "Case reports", href: "https://www.equator-network.org/reporting-guidelines/care/" },
  { title: "CONSORT 2025", detail: "Randomized trials", href: "https://www.consort-spirit.org/published-statements" },
];

export default function EnglishAuthorsPage() {
  return (
    <InternationalLayout
      eyebrow="FOR AUTHORS / SUBMISSION"
      title="Prepare carefully. Report transparently."
      lead="Guidance for researchers considering an original study, review, case report or scholarly discussion for Journal of Renal Science."
    >
      <div className="wrap jrs-en-author-page">
        <div className="jrs-en-notice-card">
          <div><span>IMPORTANT / CURRENT JOURNAL STATUS</span><strong>Know where you are submitting.</strong></div>
          <p>JRS is an independent scientific-information online journal. Publication here must not be represented as publication in an officially accredited Ukrainian professional journal or as automatically indexed, peer reviewed or assigned a DOI. External review, if conducted for an individual paper, must be explicitly documented.</p>
        </div>

        <section className="jrs-en-author-section">
          <div><span>01 / SCOPE</span><h2>What the journal considers.</h2></div>
          <div>
            <p>Research and scholarly work related to nephrology, acute and chronic kidney disease, dialysis, kidney transplantation, biomarkers, imaging and closely related clinical topics may be considered.</p>
            <ul>
              <li><strong>Original research:</strong> clinical, observational, laboratory or translational studies with original findings.</li>
              <li><strong>Reviews:</strong> systematic or narrative reviews with transparent methods and a critical appraisal of sources.</li>
              <li><strong>Case reports:</strong> clinically instructive cases with appropriate consent and protection of participant privacy.</li>
              <li><strong>Brief communications:</strong> focused or preliminary findings with proportionate conclusions.</li>
              <li><strong>Perspectives:</strong> reasoned scientific commentary clearly distinguishing evidence from interpretation.</li>
            </ul>
          </div>
        </section>

        <section className="jrs-en-author-section">
          <div><span>02 / MANUSCRIPT FORMAT</span><h2>Make the methods easy to follow.</h2></div>
          <div>
            <p>For an initial editorial assessment, submit a readable <strong>DOCX file</strong> in English or Ukrainian. A font of approximately 11–12 pt and 1.5 line spacing is recommended. The editorial team may request further language information.</p>
            <ol>
              <li>Article title; full author names; affiliations with city and country; ORCID identifiers if available.</li>
              <li>Corresponding author's email address.</li>
              <li>Abstract (approximately 150–250 words for original studies) and 3–6 keywords.</li>
              <li>Introduction, objective, methods, results, discussion and conclusions as appropriate to the study design.</li>
              <li>Consistently formatted references, preferably Vancouver style, with real DOI or URL values where available.</li>
              <li>Tables, figures, captions, funding information and relevant declarations.</li>
            </ol>
            <p>For original clinical research, describe the study population, eligibility criteria, observation period, measurements, statistical methods, missing data, limitations and effect estimates as applicable. Avoid causal claims unsupported by the study design.</p>
          </div>
        </section>

        <section className="jrs-en-author-section">
          <div><span>03 / REPORTING STANDARDS</span><h2>Use the right reporting guidance.</h2></div>
          <div>
            <p>Use established reporting guidance appropriate to your study type. These resources are independently maintained; consult their full current requirements.</p>
            <div className="jrs-en-guideline-list">
              {reportingGuides.map(guide => <a href={guide.href} target="_blank" rel="noopener noreferrer" key={guide.title}><strong>{guide.title}</strong><span>{guide.detail}</span><b aria-hidden="true">↗</b></a>)}
            </div>
          </div>
        </section>

        <section className="jrs-en-author-section">
          <div><span>04 / ETHICS AND DATA</span><h2>Protect research participants.</h2></div>
          <div>
            <p>Describe ethics committee approval or the valid reason approval was not applicable. Include information about informed consent and publication consent where required. Authors remain responsible for compliance with relevant ethical and legal requirements.</p>
            <p><strong>Do not send directly identifying patient information.</strong> Remove names, addresses, contact details, patient identifiers and identifying information embedded in images, unless a valid legal basis and appropriate permission apply. Consider the risk of re-identification even after direct identifiers are removed.</p>
            <p>Explain data availability truthfully; do not promise public access to identifiable or restricted clinical records.</p>
          </div>
        </section>

        <section className="jrs-en-author-section">
          <div><span>05 / DECLARATIONS</span><h2>State what readers need to know.</h2></div>
          <div>
            <ul>
              <li><strong>Authorship:</strong> all listed authors should have made appropriate contributions, approved the submitted version and accepted responsibility for their work.</li>
              <li><strong>Conflicts of interest:</strong> disclose relevant financial and nonfinancial relationships or explicitly declare their absence.</li>
              <li><strong>Funding:</strong> identify grants, support and funders' roles, or state that no targeted funding was received.</li>
              <li><strong>Use of AI tools:</strong> disclose material use in writing, imagery or analysis. Generative AI cannot take author responsibility.</li>
              <li><strong>Originality:</strong> disclose relevant preprints, previous dissemination, overlapping submissions and third-party material.</li>
            </ul>
            <p>For additional guidance see the <a href="https://www.icmje.org/recommendations/" target="_blank" rel="noopener noreferrer">ICMJE Recommendations ↗</a>.</p>
          </div>
        </section>

        <section className="jrs-en-author-section" id="submit">
          <div><span>06 / HOW TO SUBMIT</span><h2>Send your work to the editorial office.</h2></div>
          <div>
            <p>Email your manuscript and required supporting materials to <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua</a> with the subject <strong>“JRS — manuscript submission.”</strong> State the manuscript type, corresponding author and a short explanation of the study's scientific or practical relevance.</p>
            <div className="jrs-en-submission-callout">
              <span>READY TO CONTACT JRS?</span>
              <strong>Use your email program to send the manuscript yourself.</strong>
              <a href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20manuscript%20submission&body=Dear%20JRS%20Editorial%20Team%2C%0A%0APlease%20consider%20our%20manuscript%20entitled%3A%20%5BTitle%5D%0AManuscript%20type%3A%20%5BType%5D%0ACorresponding%20author%3A%20%5BName%5D%0AScientific%20relevance%3A%20%5BShort%20description%5D%0A%0AWe%20will%20attach%20the%20manuscript%20and%20necessary%20supporting%20files.%0A%0ASincerely%2C">Draft an email ↗</a>
            </div>
            <p>Materials undergo a suitability and editorial assessment. Specialist input may be sought if appropriate, but independent external peer review is not automatically guaranteed. The editorial decision and any completed review process must be described truthfully.</p>
          </div>
        </section>

        <div className="jrs-en-author-end">
          <span aria-hidden="true">✳</span>
          <p>Need a Ukrainian-language submission checklist or a cover-letter composer? The journal also offers <a href="/manuscript-checklist" lang="uk">a Ukrainian manuscript navigator ↗</a> and <a href="/submission-studio" lang="uk">submission studio ↗</a>. These tools are currently Ukrainian-language interfaces.</p>
        </div>
      </div>
    </InternationalLayout>
  );
}

import type { Metadata } from "next";
import InternationalLayout from "@/app/components/InternationalLayout";

export const metadata: Metadata = {
  title: "Editorial Principles (English) | Journal of Renal Science",
  description: "Transparent editorial policies of JRS: independent publication status, manuscript assessment, authorship, ethical research, rights and post-publication corrections.",
  alternates: { canonical: "/en/policy", languages: { en: "/en/policy", uk: "/editorial-policy" } },
};

const sections = [
  {
    index: "01", title: "Identity and editorial independence",
    text: [
      "Journal of Renal Science (JRS) is an independent scientific-information online publication focused on nephrology and related disciplines. Its purpose is to make research, clinical observations and critical scientific discussion accessible to readers.",
      "The current editorial board is represented by Lidiia Danylivna Denova, MD, PhD, a nephrologist. JRS does not present itself as an officially accredited Ukrainian professional journal or claim inclusion in bibliographic indexes without independent confirmation.",
    ],
  },
  {
    index: "02", title: "How manuscripts are considered",
    text: [
      "The editorial process may include an initial assessment of the subject, completeness, reporting standards, participant protection and ethical declarations; examination of methodology, analyses and conclusions; and a decision to accept, request revision or decline the work.",
      "A subject specialist may be consulted when appropriate. External independent peer review is not guaranteed for each submission. Where such review has actually taken place, it may be stated in the individual article's transparency record. Editorial assessment alone is not described as external peer review.",
    ],
  },
  {
    index: "03", title: "Research integrity and participant protection",
    text: [
      "Fabrication, falsification, plagiarism, undisclosed duplicate publication, misleading presentation of findings and unsupported scientific conclusions are unacceptable. Translations and secondary publications require appropriate attribution and permissions.",
      "Authors of medical research must explain the applicable ethics approval or valid exemption, and the consent arrangements where necessary. Reports must protect patient identities. Identifiable clinical photographs or information may be published only with an appropriate legal basis and publication consent.",
    ],
  },
  {
    index: "04", title: "Authorship, conflicts of interest and funding",
    text: [
      "Authors should confirm their contributions, approval of the final version and responsibility for the submitted work. Relevant financial, professional and personal interests, funding and the roles of funders should be disclosed.",
      "When a member of the editorial board, or another closely connected party, submits a manuscript, the assessment must not depend solely on that person's self-evaluation. Independent expertise is expected in this situation, with the editorial relationship disclosed.",
    ],
  },
  {
    index: "05", title: "Artificial intelligence and confidentiality",
    text: [
      "Authors should disclose significant use of generative AI in drafting, substantive editing, images or analysis, identifying the tool and explaining its role. AI systems cannot be listed as responsible authors. Human authors remain accountable for sources, accuracy and originality.",
      "The editorial office should not transmit unpublished manuscripts or confidential materials to external AI services without author authorization and suitable confidentiality safeguards.",
    ],
  },
  {
    index: "06", title: "Open access, copyright and licenses",
    text: [
      "JRS aims to provide articles free to read. Free reader access does not automatically grant unrestricted reuse rights.",
      "Copyright, credit, permitted reuse and the specific publication license are agreed with the author before release. No Creative Commons license should be assumed in the absence of an explicit decision and proper notice.",
    ],
  },
  {
    index: "07", title: "Corrections and continuing accountability",
    text: [
      "Substantive post-publication problems may result in a dated correction, expression of concern or retraction, as warranted by the evidence. Published scientific findings should not be altered silently.",
      "Official notices are linked to their original articles in a public editorial register, and retracted or questioned articles display reader-facing warnings. A retraction is not automatically an accusation of intentional misconduct by the authors.",
    ],
  },
  {
    index: "08", title: "Journal status, fees and complaints",
    text: [
      "The journal will state an ISSN, a registered DOI, index coverage or an official status only after it has been genuinely obtained or verified. If publication-related fees are introduced, their terms should be publicly disclosed before they are charged.",
      "Questions about manuscripts, conflicts of interest, alleged integrity problems, corrections or complaints may be sent to editor@kidney.pp.ua. Submissions and complaints are considered on the basis of the available evidence.",
    ],
  },
];

export default function EnglishPolicyPage() {
  return (
    <InternationalLayout
      eyebrow="EDITORIAL INTEGRITY / POLICY"
      title="Clear standards. Honest publishing."
      lead="An English-language overview of the current editorial commitments of Journal of Renal Science, including what the journal does and does not claim."
    >
      <div className="wrap jrs-en-policy-page">
        <div className="jrs-en-notice-card">
          <div><span>EDITORIAL STATUS</span><strong>Transparency before reputation.</strong></div>
          <p>This journal is independent and currently does not claim confirmed official accreditation, bibliographic index inclusion or universal external peer review. Individual articles can display their own factual review and integrity declarations.</p>
        </div>
        <div className="jrs-en-policy-sections">
          {sections.map(section => (
            <section key={section.index} className="jrs-en-policy-section">
              <div><span>{section.index} / JRS PRINCIPLES</span><h2>{section.title}</h2></div>
              <div>{section.text.map(text => <p key={text}>{text}</p>)}
                {section.index === "07" && <p>Read the <a href="/notices" lang="uk">public record of corrections and retractions ↗</a>. Its current interface is in Ukrainian.</p>}
                {section.index === "08" && <p>For current author guidance, see <a href="/en/authors">Information for authors ↗</a>, or contact <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua</a>.</p>}
              </div>
            </section>
          ))}
        </div>

        <div className="jrs-en-policy-references">
          <div><span className="jrs-en-eyebrow">INTERNATIONAL REFERENCE POINTS</span><h2>Scholarly ethics are a continuing responsibility.</h2></div>
          <div><p>Our editorial principles refer to widely used international resources. Their recommendations should be read in their complete, current form; linking to them does not imply endorsement or accreditation of JRS by these organizations.</p>
            <div><a href="https://publicationethics.org/" target="_blank" rel="noopener noreferrer">Committee on Publication Ethics (COPE) ↗</a><a href="https://www.icmje.org/recommendations/" target="_blank" rel="noopener noreferrer">ICMJE Recommendations ↗</a></div>
          </div>
        </div>
      </div>
    </InternationalLayout>
  );
}

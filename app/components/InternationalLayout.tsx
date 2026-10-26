import type { ReactNode } from "react";

const menu = [
  { href: "/en", label: "Overview" },
  { href: "/en/publications", label: "Research" },
  { href: "/en/topics", label: "Atlas" },
  { href: "/en/issues", label: "Issues" },
  { href: "/en/contributors", label: "Contributors" },
  { href: "/en/authors", label: "For authors" },
  { href: "/en/policy", label: "Editorial policy" },
  { href: "/en/notices", label: "Corrections & retractions" },
];

type Props = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  children: ReactNode;
  home?: boolean;
};

export default function InternationalLayout({ eyebrow, title, lead, children, home = false }: Props) {
  return (
    <div lang="en" className="jrs-en">
      <div className="jrs-en-topline">
        <div className="wrap">
          <span>INDEPENDENT · RENAL RESEARCH · OPEN ACCESS</span>
          <div className="jrs-en-languages" aria-label="Language options">
            <a href="/" lang="uk" hrefLang="uk">Українська</a>
            <span lang="en" aria-current="page">English</span>
          </div>
        </div>
      </div>
      <header className="header jrs-en-header">
        <div className="wrap jrs-en-header-inner">
          <a className="brand" href="/en" aria-label="Journal of Renal Science — English home">
            <span className="logo" aria-hidden="true"><b>J</b><b>R</b><b>S</b></span>
            <span><strong>Journal of Renal Science</strong><small>INDEPENDENT ONLINE JOURNAL</small></span>
          </a>
          <nav aria-label="English navigation">
            {menu.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <a className="jrs-en-contact" href="mailto:editor@kidney.pp.ua?subject=JRS%20manuscript%20submission">
            Contact editor ↗
          </a>
        </div>
      </header>

      <main id="top">
        {home ? (
          <section className="jrs-en-home-hero">
            <div className="wrap jrs-en-home-hero-inner">
              <div className="jrs-en-home-copy">
                <span className="jrs-en-eyebrow">{eyebrow}</span>
                <h1>{title}</h1>
                <p>{lead}</p>
                <div className="jrs-en-hero-actions">
                  <a href="/en/publications">Explore research ↗</a>
                  <a href="/en/authors">Information for authors ↗</a>
                </div>
                <div className="jrs-en-hero-tags">
                  <span>Clinical nephrology</span><span>Dialysis</span><span>Kidney transplantation</span>
                </div>
              </div>
              <div className="jrs-en-cover-scene" aria-label="Journal of Renal Science visual identity">
                <div className="jrs-en-cover-backdrop" aria-hidden="true" />
                <div className="jrs-en-cover">
                  <div className="jrs-en-cover-header"><span>JOURNAL OF</span><span>JRS</span></div>
                  <div className="jrs-en-cover-title"><span>RENAL</span><span>SCIENCE</span></div>
                  <div className="jrs-en-cover-art" aria-hidden="true">
                    <i className="one" /><i className="two" /><b />
                  </div>
                  <div className="jrs-en-cover-bottom">RESEARCH / NEPHROLOGY / CLINICAL SCIENCE</div>
                </div>
                <div className="jrs-en-cover-footnote">INDEPENDENT JOURNAL · UKRAINE</div>
              </div>
            </div>
          </section>
        ) : (
          <section className="jrs-en-subhero">
            <div className="wrap">
              <p className="jrs-en-subhero-breadcrumb"><a href="/en">English overview</a> <span>/</span> {eyebrow}</p>
              <span className="jrs-en-eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{lead}</p>
            </div>
          </section>
        )}
        <div className="jrs-en-content">{children}</div>
        <section className="jrs-en-contact-band">
          <div className="wrap jrs-en-contact-band-inner">
            <div><span>JRS / EDITORIAL OFFICE</span><h2>Have a research question or manuscript?</h2><p>Contact the editorial office to discuss the suitability of your work.</p></div>
            <a href="mailto:editor@kidney.pp.ua?subject=JRS%20research%20enquiry">editor@kidney.pp.ua ↗</a>
          </div>
        </section>
      </main>
      <footer className="jrs-en-footer">
        <div className="wrap jrs-en-footer-row">
          <div><strong>Journal of Renal Science</strong><span>Independent scientific-information online journal</span></div>
          <nav aria-label="English footer navigation">
            {menu.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}
            <a href="/" lang="uk" hrefLang="uk">Українська версія</a>
          </nav>
        </div>
        <div className="wrap jrs-en-footer-bottom"><span>© {new Date().getFullYear()} Journal of Renal Science</span><span>Editorial status and publication claims are independently described on this website.</span></div>
      </footer>
    </div>
  );
}

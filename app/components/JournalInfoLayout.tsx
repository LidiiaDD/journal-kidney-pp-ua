import type { ReactNode } from "react";

type SectionLink = { href: string; label: string };

type JournalInfoLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: SectionLink[];
  children: ReactNode;
  wide?: boolean;
};

export default function JournalInfoLayout({
  eyebrow,
  title,
  description,
  sections,
  children,
  wide = false,
}: JournalInfoLayoutProps) {
  return (
    <>
      <div className="topline">
        <div className="wrap">
          <span>Independent · Research · Open access</span>
          <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua ↗</a>
        </div>
      </div>

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" className="brand" aria-label="Journal of Renal Science — на головну">
            <span className="logo" aria-hidden="true"><b>J</b><b>R</b><b>S</b></span>
            <span><strong>Journal of Renal Science</strong><small>Незалежне видання з нефрології</small></span>
          </a>
          <nav aria-label="Навігація журналу">
            <a href="/">Головна</a>
            <a href="/topics">Атлас</a>
            <a href="/publications">Публікації</a>
            <a href="/authors">Для авторів</a>
            <a href="/editorial-policy">Редакційна політика</a>
            <a href="/#board">Редакція</a>
          </nav>
          <a className="submit" href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20%D0%BF%D0%BE%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F%20%D1%80%D1%83%D0%BA%D0%BE%D0%BF%D0%B8%D1%81%D1%83">
            Подати рукопис
          </a>
        </div>
      </header>

      <main id="top">
        <section className="info-hero">
          <div className="wrap">
            <div className="info-breadcrumbs">
              <a href="/">Головна</a><span aria-hidden="true">/</span><span>{eyebrow}</span>
            </div>
            <p className="eyebrow"><i /> {eyebrow}</p>
            <h1>{title}</h1>
            <p className="info-summary">{description}</p>
            <div className="info-context">
              <span>Journal of Renal Science</span>
              <span>Незалежне науково-інформаційне видання</span>
            </div>
            <nav className="info-switch-links" aria-label="Інформація про публікації">
              <a href="/topics">Атлас</a>
              <a href="/publications">Публікації</a>
              <a href="/authors">Правила для авторів</a>
              <a href="/editorial-policy">Редакційна політика</a>
            </nav>
          </div>
        </section>

        <section className="info-content">
          <div className={`wrap info-layout${wide ? " info-layout-wide" : ""}`}>
            {!wide && <aside className="info-sidebar" aria-label="Зміст сторінки">
              <p>На цій сторінці</p>
              <nav aria-label="Зміст">
                {sections.map((section) => (
                  <a key={section.href} href={section.href}>{section.label}</a>
                ))}
              </nav>
              <a className="info-side-contact" href="mailto:editor@kidney.pp.ua">Питання до редакції ↗</a>
            </aside>}
            <article className="info-article">{children}</article>
          </div>
        </section>

        <section className="info-cta">
          <div className="wrap info-cta-inner">
            <div>
              <p className="eyebrow pale"><i /> Зв’язок з редакцією</p>
              <h2>Маєте науковий матеріал?</h2>
              <p>Надішліть короткий опис роботи або рукопис на електронну адресу редакції.</p>
            </div>
            <a href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20%D0%BF%D0%BE%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F%20%D1%80%D1%83%D0%BA%D0%BE%D0%BF%D0%B8%D1%81%D1%83">editor@kidney.pp.ua ↗</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-top">
          <a href="/" className="brand footer-brand">
            <span className="logo"><b>J</b><b>R</b><b>S</b></span>
            <span><strong>Journal of Renal Science</strong></span>
          </a>
          <nav aria-label="Посилання у підвалі сайту">
            <a href="/">Головна</a>
            <a href="/topics">Атлас</a>
            <a href="/publications">Публікації</a>
            <a href="/authors">Для авторів</a>
            <a href="/editorial-policy">Редакційна політика</a>
            <a href="/#board">Редакційна рада</a>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} Journal of Renal Science</span>
          <span>Nephrology · Dialysis · Transplantation</span>
        </div>
      </footer>
    </>
  );
}

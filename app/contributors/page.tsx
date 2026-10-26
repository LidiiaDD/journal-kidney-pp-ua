import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ContributorDirectory from "@/app/components/ContributorDirectory";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { authorEntries } from "@/app/lib/jrs-contributors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Покажчик авторів | Journal of Renal Science",
  description: "Бібліографічний покажчик дослідників, зазначених як автори опублікованих статей Journal of Renal Science.",
  alternates: { canonical: "/contributors", languages: { uk: "/contributors", en: "/en/contributors" } },
};

export default async function ContributorsPage() {
  const publications = await allPublications();
  const contributors = authorEntries(publications);
  const rows = contributors.map(entry => ({
    key: entry.key,
    name: entry.name,
    initial: entry.initial,
    affiliation: entry.affiliations[0] || "",
    orcid: entry.orcid,
    publications: entry.articles.length,
    mostRecentYear: entry.articles.reduce((most, item) =>
      item.publishedAt.slice(0,4) > most ? item.publishedAt.slice(0,4) : most, ""),
  }));

  return (
    <JournalInfoLayout
      eyebrow="Покажчик авторів"
      title="Люди, які створюють ниркову науку."
      description="Бібліографічний покажчик імен, установ і робіт, зазначених у фактично опублікованих матеріалах Journal of Renal Science."
      sections={[]}
      wide
    >
      <a className="jrs-en-article-uk-switch" href="/en/contributors" hrefLang="en" lang="en">International contributor index ↗</a>
      <div className="contributors-overview">
        <div className="contributors-overview-text">
          <span className="contributors-eyebrow">JRS / SCHOLARLY CONTRIBUTORS</span>
          <h2>За кожним дослідженням — робота людей.</h2>
          <p>Перегляньте авторські записи та статті, до яких вони належать. Покажчик автоматично оновлюється разом з архівом — нічого не додається без реальної публікації.</p>
        </div>
        <div className="contributors-overview-stat">
          <strong>{contributors.length}</strong>
          <span>авторських записів</span>
          <div/>
          <strong>{publications.length}</strong>
          <span>опублікованих статей</span>
        </div>
      </div>

      <ContributorDirectory items={rows} />

      <div className="contributors-identity-note">
        <span aria-hidden="true">✳</span>
        <div>
          <strong>Бібліографічний покажчик, не підтверджений профіль особи</strong>
          <p>Імена та афіліації відображено з опублікованих матеріалів. Записи об’єднуються лише за коректним ідентифікатором ORCID або точним збігом імені та афіліації. Наявність ORCID у статті не означає, що журнал незалежно підтвердив його належність конкретній особі. За відсутності ідентифікатора можуть існувати окремі записи однієї людини або однакові імена різних людей.</p>
        </div>
      </div>
    </JournalInfoLayout>
  );
}

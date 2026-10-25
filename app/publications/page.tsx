import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import PublicationExplorer from "@/app/components/PublicationExplorer";
import { listPublications } from "@/app/lib/publications";

export const metadata: Metadata = {
  title: "Публікації | Journal of Renal Science",
  description:
    "Каталог наукових матеріалів Journal of Renal Science: клінічна нефрологія, діаліз, трансплантація нирки, біомаркери, клінічні дослідження.",
  alternates: { canonical: "/publications" },
};

const sections = [
  { href: "#catalogue", label: "Каталог публікацій" },
  { href: "#topics", label: "Тематика журналу" },
  { href: "#publication-details", label: "Про опубліковані матеріали" },
];

export default function PublicationsPage() {
  const items = listPublications();

  return (
    <JournalInfoLayout
      eyebrow="Публікації"
      title="Дослідження та клінічні матеріали"
      description="Архів досліджень, оглядових статей і клінічних спостережень, опублікованих у Journal of Renal Science."
      sections={sections}
    >
      <section id="catalogue" className="pub-catalogue">
        <div className="pub-catalogue-head">
          <h2>Каталог публікацій</h2>
          {items.length > 0 && <span>{items.length} матеріалів</span>}
        </div>
        <PublicationExplorer items={items} />
      </section>

      <section id="topics">
        <h2>Наукові напрями</h2>
        <p>Тематика матеріалів охоплює хронічну хворобу нирок, гостре пошкодження нирок, діаліз і замісну ниркову терапію, трансплантацію, лабораторні й візуалізаційні методи діагностики, біомаркери та супутні клінічні питання.</p>
      </section>

      <section id="publication-details">
        <h2>Інформація про публікації</h2>
        <p>Для кожного опублікованого матеріалу створюється окрема сторінка із назвою, авторами, датою, анотацією, ключовими словами та PDF, якщо такий файл доступний.</p>
        <p>Журнал є незалежним науково-інформаційним онлайн-виданням. Поява матеріалу в цьому архіві сама по собі не означає наявності ISSN, DOI, індексації або статусу офіційного фахового видання.</p>
        <p>Умови підготовки й подання рукописів наведено у <a href="/authors">правилах для авторів</a>.</p>
      </section>
    </JournalInfoLayout>
  );
}

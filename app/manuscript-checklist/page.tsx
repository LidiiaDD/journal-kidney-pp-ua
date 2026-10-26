import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ManuscriptNavigator from "@/app/components/ManuscriptNavigator";

export const metadata: Metadata = {
  title: "Навігатор рукопису | Journal of Renal Science",
  description: "Інтерактивна самоперевірка наукового рукопису перед поданням до JRS: обсерваційні дослідження, клінічні випробування, огляди, клінічні випадки й короткі повідомлення.",
  alternates: { canonical: "/manuscript-checklist" },
};

export default function ManuscriptChecklistPage() {
  return (
    <JournalInfoLayout
      eyebrow="Інструмент для авторів"
      title="Ваш рукопис. Чіткий маршрут."
      description="Перевірте повноту підготовки статті крок за кроком — від метаданих і методології до етики та фінальних декларацій."
      sections={[]}
      wide
    >
      <ManuscriptNavigator />
      <div className="manu-sources">
        <span className="manu-overline">НАУКОВІ ОРІЄНТИРИ</span>
        <p>Навігатор узагальнює окремі рекомендації та не відтворює повні офіційні чеклісти. Користуйтеся першоджерелами для перевірки специфічних вимог:</p>
        <div className="manu-source-links">
          <a href="https://www.icmje.org/recommendations/" target="_blank" rel="noopener noreferrer">ICMJE Recommendations ↗</a>
          <a href="https://www.equator-network.org/reporting-guidelines/strobe/" target="_blank" rel="noopener noreferrer">STROBE ↗</a>
          <a href="https://www.consort-spirit.org/published-statements" target="_blank" rel="noopener noreferrer">CONSORT 2025 ↗</a>
          <a href="https://www.prisma-statement.org/prisma-2020" target="_blank" rel="noopener noreferrer">PRISMA 2020 ↗</a>
          <a href="https://www.equator-network.org/reporting-guidelines/care/" target="_blank" rel="noopener noreferrer">CARE ↗</a>
        </div>
        <p>Основні правила JRS — у <a href="/authors">пам’ятці для авторів</a> та <a href="/editorial-policy">редакційній політиці</a>.</p>
      </div>
    </JournalInfoLayout>
  );
}

import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ManuscriptNavigator from "./ManuscriptNavigator";

export const metadata: Metadata = {
  title: "Навігатор рукопису | Journal of Renal Science",
  description: "Інтерактивна підготовка рукопису до подання в Journal of Renal Science: оберіть тип матеріалу, перевірте вимоги й оцініть власну готовність.",
  alternates: { canonical: "/manuscript-navigator" },
};

export default function ManuscriptNavigatorPage() {
  return (
    <JournalInfoLayout
      eyebrow="Навігатор рукопису"
      title="Підготуйте рукопис до подання."
      description="Оберіть формат наукової роботи, пройдіть відповідний чекліст і перевірте, чи готові матеріали для первинного редакційного розгляду."
      sections={[]}
      wide
    >
      <ManuscriptNavigator />
    </JournalInfoLayout>
  );
}

import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import ReadingLibrary from "@/app/components/ReadingLibrary";
import { allPublications } from "@/app/lib/jrs-catalogue";

export const metadata: Metadata = {
  title: "Моя наукова бібліотека | Journal of Renal Science",
  description: "Персональна бібліотека досліджень JRS: зберігайте опубліковані статті у браузері, знаходьте їх згодом і експортуйте бібліографічні посилання.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ReadingListPage() {
  const articles = await allPublications();
  return (
    <JournalInfoLayout
      eyebrow="Моя бібліотека"
      title="Моє місце для наукових відкриттів."
      description="Зберігайте публікації, які хочете перечитати чи процитувати. Особиста добірка працює без реєстрації."
      sections={[]}
      wide
    >
      <ReadingLibrary articles={articles} />
    </JournalInfoLayout>
  );
}

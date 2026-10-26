import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import SubmissionStudio from "@/app/components/SubmissionStudio";

export const metadata: Metadata = {
  title: "Майстер подання статті | Journal of Renal Science",
  description: "Створіть супровідний лист до Journal of Renal Science, перевірте вкладення та відкрийте повідомлення до редакції у власній поштовій програмі. Без реєстрації та зберігання даних.",
  alternates: { canonical: "/submission-studio" },
};

export default function SubmissionStudioPage() {
  return (
    <JournalInfoLayout
      eyebrow="Інструмент для авторів"
      title="Подання починається тут."
      description="Підготуйте супровідний лист до редакції JRS на основі власних даних. Перед відправленням перевірте комплект матеріалів і відкрийте лист у своїй пошті."
      sections={[]}
      wide
    >
      <SubmissionStudio />
      <div className="submission-next">
        <div>
          <span>AUTHOR WORKFLOW · JRS</span>
          <h2>Ще не впевнені, що рукопис готовий?</h2>
          <p>Скористайтеся попереднім чеклістом залежно від типу дослідження, а потім поверніться до підготовки листа.</p>
          <a href="/manuscript-checklist">Відкрити Навігатор рукопису ↗</a>
        </div>
        <div>
          <span>EDITORIAL POLICY</span>
          <h2>Наукова доброчесність — основа.</h2>
          <p>Перед надсиланням перевірте вимоги до авторства, захисту персональних даних, конфліктів інтересів і використання ШІ.</p>
          <a href="/authors">Правила для авторів ↗</a>
        </div>
      </div>
    </JournalInfoLayout>
  );
}

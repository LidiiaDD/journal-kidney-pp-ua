import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { researchTopics, topicCounts } from "@/app/lib/research-topics";

function publicationWord(count: number): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "публікацій";
  const last = count % 10;
  if (last === 1) return "публікація";
  if (last >= 2 && last <= 4) return "публікації";
  return "публікацій";
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Атлас нефрологічних досліджень | Journal of Renal Science",
  description: "Орієнтуйтеся у наукових напрямах Journal of Renal Science: ХХН, гостре пошкодження нирок, діаліз, трансплантація, біомаркери, візуалізація та клінічні випадки.",
  alternates: { canonical: "/topics", languages: { uk: "/topics", en: "/en/topics" } },
};

export default async function TopicsPage() {
  const articles = await allPublications();
  const counts = topicCounts(articles);

  return (
    <JournalInfoLayout
      eyebrow="Дослідницький атлас"
      title="Орієнтуйтеся у світі ниркової науки."
      description="Вісім тематичних напрямів, які допомагають знайти дослідження за клінічним питанням і науковим інтересом."
      sections={[]}
      wide
    >
      <a className="jrs-en-article-uk-switch" href="/en/topics" hrefLang="en">Research Atlas in English ↗</a>
      <div className="atlas-preamble">
        <div className="atlas-preamble-copy">
          <p className="atlas-kicker"><span aria-hidden="true" /> Research atlas · JRS</p>
          <h2>Від клінічного випадку — до нової наукової ідеї.</h2>
          <p>Оберіть тему, щоб переглянути опубліковані дослідження. Атлас автоматично доповнюватиметься разом із науковим архівом журналу.</p>
        </div>
        <div className="atlas-summary" aria-label="Стан наукового архіву">
          <span className="atlas-summary-number">{articles.length.toLocaleString("uk-UA")}</span>
          <span className="atlas-summary-label">опублікованих матеріалів</span>
          <span className="atlas-summary-divider" />
          <span className="atlas-summary-small">{researchTopics.length} тематичних напрямів</span>
        </div>
      </div>

      <div className="atlas-grid" aria-label="Наукові напрями">
        {researchTopics.map((topic) => (
          <a key={topic.slug} className={`atlas-card atlas-card--${topic.slug}`} href={`/publications?topic=${topic.slug}`}>
            <div className="atlas-card-top">
              <span className="atlas-card-code">JRS / {topic.code}</span>
              <span className="atlas-card-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="atlas-card-visual" aria-hidden="true">
              <span className="atlas-card-ring one" />
              <span className="atlas-card-ring two" />
              <span className="atlas-card-core" />
            </div>
            <div className="atlas-card-body">
              <span className="atlas-card-english">{topic.english}</span>
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
            </div>
            <div className="atlas-card-bottom">
              <span>{topic.keywords}</span>
              <strong>{counts[topic.slug]} {publicationWord(counts[topic.slug])}</strong>
            </div>
          </a>
        ))}
      </div>

      <div className="atlas-footer-note">
        <div>
          <span className="atlas-asterisk" aria-hidden="true">✳</span>
          <strong>Живий тематичний каталог</strong>
          <p>Матеріали розподіляються за назвами та ключовими словами; одна робота може входити до кількох напрямів. Кількість публікацій відображає лише фактично оприлюднені статті, без чернеток і демонстраційних записів.</p>
        </div>
        <a href="/publications">Увесь архів ↗</a>
      </div>

      <div className="atlas-author-strip">
        <span>CONTRIBUTE TO RENAL SCIENCE</span>
        <h2>Маєте дослідження, яке варто побачити?</h2>
        <p>Ознайомтеся з правилами подання та редакційною політикою незалежного видання JRS.</p>
        <a href="/authors">Правила для авторів ↗</a>
      </div>
    </JournalInfoLayout>
  );
}

import type { Publication } from "@/app/lib/publications";

export type TopicSlug =
  | "ckd" | "aki" | "dialysis" | "transplant"
  | "biomarkers" | "imaging" | "cases" | "other";

export type ResearchTopic = {
  slug: TopicSlug;
  code: string;
  title: string;
  english: string;
  description: string;
  keywords: string;
  patterns: readonly RegExp[];
};

export const researchTopics: readonly ResearchTopic[] = [
  {
    slug: "ckd", code: "01", title: "Хронічна хвороба нирок",
    english: "Chronic Kidney Disease",
    description: "Перебіг ХХН, фактори ризику, прогресування, коморбідність та довгострокове спостереження.",
    keywords: "ХХН · eGFR · нефропротекція",
    patterns: [/\bckd\b|\begfr\b|\bgfr\b|\bххн\b|хронічн\w*\s+(?:хвороб|захворюван)\w*\s+нир\w*|chronic\s+kidney|glomerul|гломерул|нефропротекц|nephroprotect/i],
  },
  {
    slug: "aki", code: "02", title: "Гостре пошкодження нирок",
    english: "Acute Kidney Injury",
    description: "ГПН, гострі клінічні стани, відновлення функції нирок та ведення пацієнтів високого ризику.",
    keywords: "ГПН · AKI · інтенсивна терапія",
    patterns: [/\baki\b|\bгпн\b|acute\s+(?:kidney|renal)|гостр\w*\s+(?:пошкоджен|недостатн|уражен)\w*\s+нир\w*|тубулоінтерстиціальн|tubulointerstitial/i],
  },
  {
    slug: "dialysis", code: "03", title: "Діаліз та НЗТ",
    english: "Dialysis & Kidney Replacement",
    description: "Гемодіаліз, перитонеальний діаліз, замісна ниркова терапія та результати лікування.",
    keywords: "ГД · ПД · НЗТ",
    patterns: [/діаліз|dialysis|гемодіаліз|hemodial|haemodial|перитонеальн|peritoneal|нирков\w*\s+замісн|renal\s+replacement|kidney\s+replacement|\bcrrt\b|\brrt\b|\bнзт\b/i],
  },
  {
    slug: "transplant", code: "04", title: "Трансплантація",
    english: "Kidney Transplantation",
    description: "Трансплантація нирки, імуносупресія, ведення реципієнтів та післяопераційні результати.",
    keywords: "Трансплантат · реципієнт · імуносупресія",
    patterns: [/трансплант|transplant|алотрансплан|реципієнт|recipient|імунодепрес|імуносупрес|immunosuppress/i],
  },
  {
    slug: "biomarkers", code: "05", title: "Біомаркери та молекулярні дослідження",
    english: "Biomarkers & Translational Science",
    description: "Уромодулін, молекулярні маркери, лабораторні дослідження та нові методи прогнозування.",
    keywords: "Уромодулін · біомаркери · лабораторія",
    patterns: [/біомаркер|biomarker|uromodulin|уромодулін|\bsumod\b|\buumod\b|протеом|proteom|генетик|genetic|молекулярн|molecular/i],
  },
  {
    slug: "imaging", code: "06", title: "Візуалізація та діагностика",
    english: "Imaging & Diagnostics",
    description: "УЗД нирок, променева діагностика, структурні зміни та скринінгові методики.",
    keywords: "УЗД · imaging · скринінг",
    patterns: [/ультразвук|\bузд\b|ultrasound|сонограф|sonograph|візуаліз|imaging|доплер|doppler|radiolog|томограф|tomograph|\bmri\b|\bкт\b|скринінг|screening/i],
  },
  {
    slug: "cases", code: "07", title: "Клінічні випадки",
    english: "Clinical Case Reports",
    description: "Документовані клінічні спостереження, діагностичні труднощі та практичні висновки.",
    keywords: "Клінічні спостереження · case reports",
    patterns: [/клінічн\w*\s+випад|case\s+report|case\s+study|клінічн\w*\s+спостереж/i],
  },
  {
    slug: "other", code: "08", title: "Інші дослідження",
    english: "Further Renal Research",
    description: "Суміжні питання нефрології, міждисциплінарні дослідження та матеріали поза основними темами.",
    keywords: "Міждисциплінарність · перспективи",
    patterns: [],
  },
];

export function isTopicSlug(value: string): value is TopicSlug {
  return researchTopics.some(topic => topic.slug === value);
}

/**
 * Lightweight discovery classification based on published metadata, not scientific
 * quality scoring. A paper can appear in several relevant areas; unmatched work
 * is kept in "other", so published research is never silently excluded.
 */
export function topicsForPublication(article: Publication): TopicSlug[] {
  const names = [
    article.title,
    ...(article.keywords || []),
    ...(article.translations?.uk ? [article.translations.uk.title, ...article.translations.uk.keywords] : []),
    ...(article.translations?.en ? [article.translations.en.title, ...article.translations.en.keywords] : []),
  ].join(" ");
  const matches = researchTopics
    .filter(topic => topic.slug !== "other"
      && (topic.patterns.some(pattern => pattern.test(names))
        || (topic.slug === "cases" && article.type === "case-report")))
    .map(topic => topic.slug);
  return matches.length ? matches : ["other"];
}

export function topicCounts(articles: readonly Publication[]): Record<TopicSlug, number> {
  const counts = Object.fromEntries(researchTopics.map(topic => [topic.slug, 0])) as Record<TopicSlug, number>;
  for (const article of articles) {
    for (const slug of topicsForPublication(article)) counts[slug] += 1;
  }
  return counts;
}

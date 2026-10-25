import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublicArticle } from "@/app/lib/jrs-catalogue";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import {
  formatPublicationDate,
  publicationTypeLabels,
} from "@/app/lib/publications";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publication = await findPublicArticle(slug);
  if (!publication) return { title: "Публікацію не знайдено | JRS" };

  return {
    title: `${publication.title} | Journal of Renal Science`,
    description: publication.abstract.slice(0, 175),
    alternates: { canonical: `/publications/${publication.slug}` },
    openGraph: {
      title: publication.title,
      description: publication.abstract.slice(0, 175),
      type: "article",
      publishedTime: publication.publishedAt,
    },
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const item = await findPublicArticle(slug);
  if (!item) notFound();

  const sections = [
    { href: "#abstract", label: "Анотація" },
    { href: "#authors", label: "Автори" },
    { href: "#keywords", label: "Ключові слова" },
    { href: "#citation", label: "Бібліографічні дані" },
    ...(item.pdfUrl ? [{ href: "#pdf", label: "Повний текст PDF" }] : []),
  ];

  return (
    <JournalInfoLayout
      eyebrow="Наукова публікація"
      title={item.title}
      description={`${publicationTypeLabels[item.type]} · ${formatPublicationDate(item.publishedAt)}`}
      sections={sections}
    >
      <p className="pub-back"><a href="/publications">← Усі публікації</a></p>
      <section id="abstract">
        <p className="pub-article-type">{publicationTypeLabels[item.type]}</p>
        <h2>Анотація</h2>
        <p className="pub-article-abstract">{item.abstract}</p>
      </section>

      <section id="authors">
        <h2>Автори</h2>
        <ul className="pub-author-list">
          {item.authors.map((author, index) => (
            <li key={`${author.name}-${index}`}>
              <strong>{author.name}</strong>
              {author.affiliation && <span>{author.affiliation}</span>}
              {author.orcid && (
                <a
                  href={`https://orcid.org/${author.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ORCID: {author.orcid} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="keywords">
        <h2>Ключові слова</h2>
        <div className="pub-keywords">
          {item.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
        </div>
      </section>

      <section id="citation">
        <h2>Бібліографічні дані</h2>
        <dl className="pub-citation">
          <div><dt>Дата публікації</dt><dd><time dateTime={item.publishedAt}>{formatPublicationDate(item.publishedAt)}</time></dd></div>
          <div><dt>Тип матеріалу</dt><dd>{publicationTypeLabels[item.type]}</dd></div>
          <div><dt>Мова</dt><dd>{item.language === "uk" ? "Українська" : "Англійська"}</dd></div>
          {item.volume && <div><dt>Том</dt><dd>{item.volume}</dd></div>}
          {item.issue && <div><dt>Випуск</dt><dd>{item.issue}</dd></div>}
          {item.pages && <div><dt>Сторінки</dt><dd>{item.pages}</dd></div>}
          {item.doi && <div><dt>DOI</dt><dd><a href={`https://doi.org/${item.doi}`} target="_blank" rel="noopener noreferrer">{item.doi} ↗</a></dd></div>}
          <div><dt>Видання</dt><dd>Journal of Renal Science — незалежний науково-інформаційний журнал</dd></div>
        </dl>
      </section>

      {item.pdfUrl && (
        <section id="pdf">
          <h2>Повний текст</h2>
          <p>Доступний PDF-файл матеріалу.</p>
          <a className="pub-download" href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
            Відкрити PDF ↗
          </a>
        </section>
      )}
      <p className="pub-final-note">Публікація відображає результати та висновки її авторів. Медичні рішення потребують індивідуальної клінічної оцінки.</p>
    </JournalInfoLayout>
  );
}

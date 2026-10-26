import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import BookmarkButton from "@/app/components/BookmarkButton";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { findAuthorEntry } from "@/app/lib/jrs-contributors";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const author = findAuthorEntry(await allPublications(), key);
  if (!author) return { title: "Авторський запис не знайдено | JRS" };
  return {
    title: `${author.name} — публікації у JRS`,
    description: `Бібліографічний покажчик робіт ${author.name} у Journal of Renal Science: ${author.articles.length} опублікованих матеріалів.`,
    alternates: { canonical: `/contributors/${author.key}` },
  };
}

export default async function ContributorDetailPage({ params }: Props) {
  const { key } = await params;
  const author = findAuthorEntry(await allPublications(), key);
  if (!author) notFound();
  const articles = [...author.articles].sort((a,b)=>
    b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "uk"));

  return (
    <JournalInfoLayout
      eyebrow="Авторський покажчик"
      title={author.name}
      description={`Бібліографічний запис на основі ${articles.length} опублікованих матеріалів у Journal of Renal Science.`}
      sections={[]}
      wide
    >
      <p className="pub-back"><a href="/contributors">← До покажчика авторів</a></p>
      <div className="contributor-profile-head">
        <div className="contributor-profile-avatar" aria-hidden="true">{author.initial}</div>
        <div className="contributor-profile-copy">
          <span className="contributors-eyebrow">JRS / PUBLICATION RECORD</span>
          <h2>{author.name}</h2>
          {author.affiliations.length > 0 && (
            <div className="contributor-profile-affiliations">
              <strong>Установи, зазначені у статтях</strong>
              {author.affiliations.map(affiliation => <span key={affiliation}>{affiliation}</span>)}
            </div>
          )}
          {author.orcid && <a className="contributor-orcid-link"
            href={`https://orcid.org/${author.orcid}`} target="_blank" rel="noopener noreferrer">
            ORCID у статтях: {author.orcid} ↗
          </a>}
        </div>
        <div className="contributor-profile-stat">
          <strong>{articles.length}</strong>
          <span>статей у JRS</span>
        </div>
      </div>

      <section className="contributor-works" aria-labelledby="contributor-works-title">
        <div className="contributor-works-heading">
          <span className="contributors-eyebrow">PUBLICATION RECORD</span>
          <h2 id="contributor-works-title">Наукові матеріали</h2>
          <p>Матеріали впорядковано за датою публікації. Дані про авторство наведено так, як їх оприлюднила редакція.</p>
        </div>
        <div className="contributor-works-list">
          {articles.map((article,index)=><article key={article.slug} className="contributor-work">
            <span className="contributor-work-number">{String(index+1).padStart(2,"0")}</span>
            <div>
              <div className="contributor-work-meta">
                <span>{publicationTypeLabels[article.type]}</span>
                <time dateTime={article.publishedAt}>{formatPublicationDate(article.publishedAt)}</time>
              </div>
              <h3><a href={`/publications/${article.slug}`}>{article.title}</a></h3>
              <p>{article.authors.map(a=>a.name).join(", ")}</p>
              <div className="contributor-work-actions">
                <a href={`/publications/${article.slug}`}>Читати статтю ↗</a>
                {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">PDF ↗</a>}
                <BookmarkButton slug={article.slug} compact />
              </div>
            </div>
          </article>)}
        </div>
      </section>

      <div className="contributors-identity-note">
        <span aria-hidden="true">✳</span>
        <div>
          <strong>Про походження авторського запису</strong>
          <p>Ця сторінка не є персональним кабінетом, підтвердженням особи, CV або незалежно верифікованою біографією. Тут зібрано тільки метадані вже опублікованих статей JRS. Якщо потрібне уточнення імені, установи чи авторства, зверніться до редакції.</p>
          <a href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20%D1%83%D1%82%D0%BE%D1%87%D0%BD%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D1%81%D1%82%D0%B2%D0%B0">Повідомити редакцію ↗</a>
        </div>
      </div>
    </JournalInfoLayout>
  );
}

/**
 * Approved, publicly released publications only.
 *
 * To add a publication:
 * 1. Confirm author consent, ethics and editorial approval.
 * 2. Upload a sanitized PDF to public/publications/<slug>.pdf if available.
 * 3. Add one complete object to the publications array below.
 * 4. Commit both files and redeploy the site.
 *
 * Do not include draft, rejected or confidential manuscripts here.
 */

export type PublicationType =
  | "original-research"
  | "review"
  | "case-report"
  | "brief-report"
  | "perspective";

export type PublicationAuthor = {
  name: string;
  affiliation?: string;
  orcid?: string;
};

export type TranslatedMetadata = {
  title: string;
  abstract: string;
  keywords: string[];
};

export type ArticleTransparency = {
  /** Claim from the actual editorial workflow; independent review must be documented. */
  reviewKind?: "editorial" | "external";
  reviewDetails?: string;
  ethicsStatement?: string;
  consentStatement?: string;
  fundingStatement?: string;
  competingInterests?: string;
  dataAvailability?: string;
  authorContributions?: string;
  aiDisclosure?: string;
};

export type Publication = {
  /** Permanent URL part: lowercase latin letters, numbers, hyphens. */
  slug: string;
  title: string;
  /** ISO date: YYYY-MM-DD, assigned at the time of actual publication. */
  publishedAt: string;
  type: PublicationType;
  language: "uk" | "en";
  authors: PublicationAuthor[];
  abstract: string;
  keywords: string[];
  /** Human-reviewed alternate-language metadata; never generated implicitly. */
  translations?: Partial<Record<"uk" | "en", TranslatedMetadata>>;
  /** Numbered references provided and checked by the editor. */
  references?: string[];
  transparency?: ArticleTransparency;
  /** Optional, e.g. /publications/example-study.pdf */
  pdfUrl?: string;
  /** Only include if a DOI has actually been registered. */
  doi?: string;
  /** Optional citation details, once an issue exists. */
  volume?: string;
  issue?: string;
  pages?: string;
};

export const publicationTypeLabels: Record<PublicationType, string> = {
  "original-research": "Оригінальне дослідження",
  review: "Оглядова стаття",
  "case-report": "Клінічний випадок",
  "brief-report": "Коротке повідомлення",
  perspective: "Аналітична стаття",
};

/** Add approved publications here. The empty array is deliberate. */
export const publications: Publication[] = [];

export function listPublications(): Publication[] {
  return [...publications].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "uk")
  );
}

export function findPublication(slug: string): Publication | undefined {
  return publications.find((publication) => publication.slug === slug);
}

export function formatPublicationDate(date: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date + "T00:00:00Z"));
}

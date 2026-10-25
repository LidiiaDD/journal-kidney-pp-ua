import "server-only";
import type { Publication } from "./publications";
import { listPublications } from "./publications";
import { getPublishedArticle, listPublishedArticles } from "./jrs-supabase";

/**
 * Public data only: Supabase RLS returns published rows, never private drafts.
 * Legacy curated publications remain available while JRS moves to the editor UI.
 */
export async function allPublications(): Promise<Publication[]> {
  const existing = listPublications();
  const remote = await listPublishedArticles();
  const bySlug = new Map(existing.map(item => [item.slug, item]));
  for (const item of remote) bySlug.set(item.slug, item);
  return [...bySlug.values()].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "uk")
  );
}

export async function findPublicArticle(slug: string): Promise<Publication | undefined> {
  const remote = await getPublishedArticle(slug);
  return remote || listPublications().find(item => item.slug === slug);
}

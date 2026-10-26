import type { MetadataRoute } from "next";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { groupPublishedIssues, issueHref } from "@/app/lib/jrs-issues";

const origin = "https://journal.kidney.pp.ua";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = ["/", "/topics", "/publications", "/issues", "/authors", "/manuscript-checklist", "/submission-studio", "/editorial-policy"].map(
    (path) => ({ url: origin + path })
  );

  const publications = await allPublications();
  const articles = publications.map((item) => ({
    url: `${origin}/publications/${item.slug}`,
    lastModified: new Date(item.publishedAt + "T00:00:00Z"),
  }));
  const issues = groupPublishedIssues(publications).map(issue => ({
    url: origin + issueHref(issue.key),
    lastModified: new Date(issue.latestArticleDate + "T00:00:00Z"),
  }));

  return [...core, ...issues, ...articles];
}

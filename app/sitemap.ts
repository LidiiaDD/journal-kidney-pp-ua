import type { MetadataRoute } from "next";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { allPublicNotices, noticeUrl } from "@/app/lib/jrs-notices";
import { groupPublishedIssues, issueHref } from "@/app/lib/jrs-issues";
import { authorEntries } from "@/app/lib/jrs-contributors";

const origin = "https://journal.kidney.pp.ua";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = ["/", "/topics", "/publications", "/contributors", "/issues", "/notices", "/follow", "/authors", "/manuscript-checklist", "/submission-studio", "/editorial-policy"].map(
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

  const notices = (await allPublicNotices()).map(item => ({
    url: origin + noticeUrl(item.id),
    lastModified: new Date(item.issued_at),
  }));

  const contributors = authorEntries(publications).map(author => ({
    url: `${origin}/contributors/${author.key}`,
  }));

  return [...core, ...issues, ...articles, ...contributors, ...notices];
}

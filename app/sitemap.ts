import type { MetadataRoute } from "next";
import { allPublications } from "@/app/lib/jrs-catalogue";

const origin = "https://journal.kidney.pp.ua";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = ["/", "/topics", "/publications", "/authors", "/manuscript-checklist", "/submission-studio", "/editorial-policy"].map(
    (path) => ({ url: origin + path })
  );

  const articles = (await allPublications()).map((item) => ({
    url: `${origin}/publications/${item.slug}`,
    lastModified: new Date(item.publishedAt + "T00:00:00Z"),
  }));

  return [...core, ...articles];
}

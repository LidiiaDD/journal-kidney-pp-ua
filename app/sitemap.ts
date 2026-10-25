import type { MetadataRoute } from "next";
import { listPublications } from "@/app/lib/publications";

const origin = "https://journal.kidney.pp.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  const core = ["/", "/publications", "/authors", "/editorial-policy"].map(
    (path) => ({ url: origin + path })
  );

  const articles = listPublications().map((item) => ({
    url: `${origin}/publications/${item.slug}`,
    lastModified: new Date(item.publishedAt + "T00:00:00Z"),
  }));

  return [...core, ...articles];
}

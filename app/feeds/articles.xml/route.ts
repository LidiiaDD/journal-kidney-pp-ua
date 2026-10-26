import { allPublications } from "@/app/lib/jrs-catalogue";
import { buildJrsRss } from "@/app/lib/jrs-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await allPublications();
  return new Response(buildJrsRss(articles, [], "articles"), {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

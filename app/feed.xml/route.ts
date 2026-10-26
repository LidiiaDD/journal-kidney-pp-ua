import { allPublications } from "@/app/lib/jrs-catalogue";
import { allPublicNotices } from "@/app/lib/jrs-notices";
import { buildJrsRss } from "@/app/lib/jrs-feed";

export const dynamic = "force-dynamic";

/**
 * The catalog and notice queries contain public records only. Deliberately
 * propagate backend failures rather than silently omit editorial notices.
 */
export async function GET() {
  const [articles, notices] = await Promise.all([
    allPublications(),
    allPublicNotices(),
  ]);
  return new Response(buildJrsRss(articles, notices), {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

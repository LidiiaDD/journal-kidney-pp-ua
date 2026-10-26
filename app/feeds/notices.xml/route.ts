import { allPublicNotices } from "@/app/lib/jrs-notices";
import { buildJrsRss } from "@/app/lib/jrs-feed";

export const dynamic = "force-dynamic";

/** Errors propagate instead of incorrectly hiding an official editorial notice. */
export async function GET() {
  const notices = await allPublicNotices();
  return new Response(buildJrsRss([], notices, "notices"), {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

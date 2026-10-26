import { jrsReleaseInfo } from "@/app/lib/jrs-release-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Non-sensitive deployment identity only.
 * No Supabase reads, no credentials, no manuscript metadata.
 */
export function GET() {
  return Response.json(jrsReleaseInfo(process.env), {
    headers: {
      "Cache-Control": "public, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

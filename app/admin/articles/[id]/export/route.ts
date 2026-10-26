import { getEditorArticle, requireEditor } from "@/app/lib/jrs-supabase";
import { draftMetadataFilename, makeDraftMetadataExport } from "@/app/lib/jrs-draft-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/**
 * A private, read-only download. Authentication and the editor allowlist are
 * checked on every request before accessing the saved manuscript.
 *
 * Never provide a public route, public cache, temporary unauthenticated URL,
 * or a PDF storage path in this export.
 */
export async function GET(_request: Request, { params }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  let article;
  try {
    article = await getEditorArticle(id, token);
  } catch {
    return new Response("Draft temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!article || article.status !== "draft") {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const exportedAt = new Date().toISOString();
  const archive = makeDraftMetadataExport(article, exportedAt);
  const filename = draftMetadataFilename(article.slug, exportedAt);

  return new Response(JSON.stringify(archive, null, 2) + "\n", {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
    },
  });
}

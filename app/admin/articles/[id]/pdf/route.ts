import { NextRequest, NextResponse } from "next/server";
import { getEditorArticle, jrsFetch, requireEditor } from "@/app/lib/jrs-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Props) {
  const { token } = await requireEditor();
  const { id } = await params;
  const article = await getEditorArticle(id, token);
  if (!article?.pdf_path) return new Response("PDF not found", { status: 404 });

  const objectPath = article.pdf_path.split("/").map(encodeURIComponent).join("/");
  const file = await jrsFetch(`/storage/v1/object/authenticated/jrs-pdfs/${objectPath}`, {}, token);
  if (!file.ok || !file.body) return new Response("PDF unavailable", { status: 404 });
  return new Response(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${article.slug}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest, { params }: Props) {
  const target = (error?: string) => {
    const url = new URL(`/admin/articles/${id}`, request.url);
    url.searchParams.set(error ? "error" : "saved", error || "1");
    return NextResponse.redirect(url, 303);
  };
  const { token, editor } = await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Invalid article", { status: 400 });

  // Prevent cross-site form posts and overly large request bodies.
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return new Response("Forbidden", { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 3_700_000) return target("pdf");

  const article = await getEditorArticle(id, token);
  if (!article || article.status !== "draft") return new Response("Only drafts can be changed", { status: 403 });

  const form = await request.formData().catch(() => null);
  const document = form?.get("pdf");
  if (!(document instanceof File) || document.size === 0 || document.size > 3_500_000 ||
      !(document.type === "application/pdf" || document.type === "application/octet-stream" || !document.type)) {
    return target("pdf");
  }
  const bytes = new Uint8Array(await document.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") return target("pdf");

  const object = `${editor.id}/${crypto.randomUUID()}.pdf`;
  const response = await jrsFetch(
    `/storage/v1/object/jrs-pdfs/${object}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/pdf", "x-upsert": "false" },
      body: bytes,
    },
    token
  );
  if (!response.ok) return target("pdf");

  const patch = await jrsFetch(
    `/rest/v1/jrs_articles?id=eq.${id}&status=eq.draft`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ pdf_path: object, updated_at: new Date().toISOString() }),
    },
    token
  );
  if (!patch.ok) return target("save");
  const rows = await patch.json() as unknown[];
  if (!rows.length) return target("save");

  // Previous versions remain private; do not remove any source PDF unless
  // its current publication state has been verified.
  return target();
}

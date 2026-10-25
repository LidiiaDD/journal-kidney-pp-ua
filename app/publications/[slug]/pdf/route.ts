import { getPublishedRow } from "@/app/lib/jrs-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = await getPublishedRow(slug);
  } catch {
    return new Response("Unavailable", { status: 503 });
  }

  // Never fetch draft files: the RLS policy also checks published status.
  if (!article || article.status !== "published" || !article.pdf_path) {
    return new Response("Not found", { status: 404 });
  }

  // Use the server-only secret ONLY after the public RLS query confirms publication.
  // Never forward this key or a signed Storage URL to the browser.
  const secret = process.env.JRS_SUPABASE_SECRET_KEY;
  const origin = process.env.JRS_SUPABASE_URL;
  if (!secret || !origin) return new Response("PDF service is not configured", { status: 503 });
  if (!new RegExp("^[0-9a-f-]{36}/[0-9a-f-]{36}[.]pdf$", "i").test(article.pdf_path)) {
    return new Response("Invalid stored path", { status: 404 });
  }
  const objectPath = article.pdf_path.split("/").map(encodeURIComponent).join("/");
  const file = await fetch(
    `${origin.replace(/[/]$/, "")}/storage/v1/object/authenticated/jrs-pdfs/${objectPath}`,
    { headers: { apikey: secret }, cache: "no-store" }
  );
  if (!file.ok || !file.body) return new Response("PDF unavailable", { status: 404 });

  return new Response(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${article.slug}.pdf"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

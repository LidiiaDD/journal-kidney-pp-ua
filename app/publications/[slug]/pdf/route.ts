import { getPublishedRow, jrsFetch } from "@/app/lib/jrs-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  let article;
  try {
    // This query is subject to public RLS: only a published article can pass.
    article = await getPublishedRow(slug);
  } catch {
    return new Response("Unavailable", { status: 503 });
  }

  if (!article || article.status !== "published" || !article.pdf_path) {
    return new Response("Not found", { status: 404 });
  }
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}[.]pdf$/i.test(article.pdf_path)) {
    return new Response("Invalid stored path", { status: 404 });
  }

  const objectPath = article.pdf_path.split("/").map(encodeURIComponent).join("/");
  // Read using only the publishable key, never a privileged secret.
  // Storage RLS allows downloading published files, not drafts or listings.
  let file: Response;
  try {
    file = await jrsFetch(`/storage/v1/object/authenticated/jrs-pdfs/${objectPath}`);
  } catch {
    return new Response("PDF unavailable", { status: 503 });
  }
  if (!file.ok || !file.body) return new Response("PDF unavailable", { status: 404 });

  return new Response(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${article.slug}.pdf"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

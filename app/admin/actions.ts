"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession, getEditorArticle, jrsFetch, jrsJson, requireEditor,
  signInEditor,
} from "@/app/lib/jrs-supabase";
import type { ArticleRow } from "@/app/lib/jrs-supabase";
import type { PublicationAuthor, PublicationType } from "@/app/lib/publications";

const ALLOWED_TYPES: PublicationType[] = [
  "original-research", "review", "case-report", "brief-report", "perspective",
];

function value(data: FormData, name: string, maxLength = 15000): string {
  return String(data.get(name) || "").trim().slice(0, maxLength);
}

export async function signInAction(data: FormData) {
  const email = value(data, "email", 250);
  const password = value(data, "password", 500);
  if (!email || !password) redirect("/admin/login?error=invalid");
  try {
    const valid = await signInEditor(email, password);
    if (valid) redirect("/admin");
  } catch (err) {
    // Next.js redirect throws a control-flow exception that must not be swallowed.
    if (err && typeof err === "object" && "digest" in err &&
        String((err as {digest?: string}).digest).startsWith("NEXT_REDIRECT")) throw err;
  }
  redirect("/admin/login?error=invalid");
}

export async function signOutAction() {
  await clearSession();
  redirect("/admin/login");
}

function parseArticle(data: FormData): Omit<ArticleRow, "id" | "status" | "pdf_path" | "published_at" | "created_at" | "updated_at"> | null {
  const slug = value(data, "slug", 100).toLowerCase();
  const title = value(data, "title", 500);
  const abstract = value(data, "abstract", 15000);
  const type = value(data, "type", 40) as PublicationType;
  const language = value(data, "language", 2) as "uk" | "en";
  const authorLines = value(data, "authors", 7000).split("\n").map(x => x.trim()).filter(Boolean);
  const authors: PublicationAuthor[] = authorLines.slice(0, 40).map(line => {
    const [name = "", affiliation = "", orcid = ""] = line.split("|").map(x => x.trim());
    return { name: name.slice(0, 200), ...(affiliation ? { affiliation: affiliation.slice(0, 300) } : {}),
      ...(orcid ? { orcid } : {}) };
  });
  const keywords = value(data, "keywords", 2000).split(/[,;\n]/).map(x => x.trim()).filter(Boolean).slice(0, 20);

  if (!/^[a-z0-9-]{3,100}$/.test(slug) ||
      title.length < 5 || abstract.length < 20 ||
      !ALLOWED_TYPES.includes(type) || !["uk","en"].includes(language) ||
      authors.length === 0 ||
      authors.some(a => !a.name || (a.orcid && !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(a.orcid))) ||
      keywords.length === 0) return null;
  return { slug, title, abstract, type, language, authors, keywords };
}

export async function saveDraftAction(data: FormData) {
  const { token } = await requireEditor();
  const payload = parseArticle(data);
  const id = value(data, "id", 36);
  const back = id && /^[0-9a-f-]{36}$/i.test(id) ? `/admin/articles/${id}` : "/admin/articles/new";
  if (!payload) redirect(`${back}?error=fields`);

  try {
    if (id) {
      const existing = await getEditorArticle(id, token);
      if (!existing || existing.status !== "draft") redirect("/admin?error=locked");
      const response = await jrsFetch(
        `/rest/v1/jrs_articles?id=eq.${id}&status=eq.draft`,
        { method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }) },
        token
      );
      if (!response.ok) redirect(`${back}?error=save`);
      revalidatePath("/admin");
      redirect(`${back}?saved=1`);
    }
    const rows = await jrsJson<ArticleRow[]>("/rest/v1/jrs_articles?select=*", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ ...payload, status: "draft" }),
    }, token);
    const article = rows[0];
    if (!article) redirect("/admin/articles/new?error=save");
    revalidatePath("/admin");
    redirect(`/admin/articles/${article.id}?created=1`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err &&
        String((err as {digest?: string}).digest).startsWith("NEXT_REDIRECT")) throw err;
    redirect(`${back}?error=save`);
  }
}

export async function publishAction(data: FormData) {
  const { token } = await requireEditor();
  const id = value(data, "id", 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin");
  const article = await getEditorArticle(id, token);
  if (!article || article.status !== "draft" ||
      !article.title || !article.abstract || !article.authors?.length || !article.keywords?.length) {
    redirect("/admin?error=locked");
  }

  const publishedAt = new Date().toISOString().slice(0, 10);
  const response = await jrsFetch(
    `/rest/v1/jrs_articles?id=eq.${id}&status=eq.draft`,
    { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ status: "published", published_at: publishedAt, updated_at: new Date().toISOString() }) },
    token
  );
  if (!response.ok) redirect(`/admin/articles/${id}?error=publish`);
  const changed = await response.json() as ArticleRow[];
  if (!changed.length) redirect(`/admin/articles/${id}?error=publish`);
  revalidatePath("/publications");
  revalidatePath(`/publications/${article.slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/articles/${id}?published=1`);
}

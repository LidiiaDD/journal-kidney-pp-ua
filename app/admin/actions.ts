"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession, getAccessToken, getEditorArticle, jrsFetch, jrsJson, requireEditor,
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
  const token = await getAccessToken();
  if (token) {
    await jrsFetch("/auth/v1/logout", { method: "POST" }, token).catch(() => null);
  }
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
  const translatedLanguage = language === "uk" ? "en" : "uk";
  const titleTranslation = value(data, `title_${translatedLanguage}`, 500);
  const abstractTranslation = value(data, `abstract_${translatedLanguage}`, 15000);
  const translatedKeywords = value(data, `keywords_${translatedLanguage}`, 2000)
    .split(/[,;\n]/).map(x => x.trim()).filter(Boolean).slice(0, 20);
  const translationPresent = Boolean(titleTranslation || abstractTranslation || translatedKeywords.length);
  const translationComplete = titleTranslation.length >= 5
    && abstractTranslation.length >= 20
    && translatedKeywords.length >= 1;

  const rawReferences = value(data, "references_list", 30000)
    .split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const doi = value(data, "doi", 180) || null;
  const volume = value(data, "volume", 35) || null;
  const issue = value(data, "issue", 35) || null;
  const pages = value(data, "pages", 60) || null;
  const reviewRaw = value(data, "review_kind", 20);
  if (!["", "editorial", "external"].includes(reviewRaw)) return null;
  const reviewKind = (reviewRaw || null) as "editorial" | "external" | null;
  const reviewDetails = value(data, "review_details", 2000) || null;

  const disclosures = {
    ethics_statement: value(data, "ethics_statement", 3500) || null,
    consent_statement: value(data, "consent_statement", 3500) || null,
    funding_statement: value(data, "funding_statement", 3500) || null,
    competing_interests: value(data, "competing_interests", 3500) || null,
    data_availability: value(data, "data_availability", 3500) || null,
    author_contributions: value(data, "author_contributions", 3500) || null,
    ai_disclosure: value(data, "ai_disclosure", 3500) || null,
  };

  if (!/^[a-z0-9-]{3,100}$/.test(slug) ||
      title.length < 5 || abstract.length < 20 ||
      !ALLOWED_TYPES.includes(type) || !["uk","en"].includes(language) ||
      authors.length === 0 ||
      authors.some(a => !a.name || (a.orcid && !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(a.orcid))) ||
      keywords.length === 0 ||
      (translationPresent && !translationComplete) ||
      rawReferences.length > 150 || (doi !== null && !/^10[.]\d{4,9}\/\S+$/.test(doi)) ||
      (reviewKind === "external" && (!reviewDetails || reviewDetails.length < 20))) return null;

  return {
    slug, title, abstract, type, language, authors, keywords,
    title_uk: translatedLanguage === "uk" && translationPresent ? titleTranslation : null,
    abstract_uk: translatedLanguage === "uk" && translationPresent ? abstractTranslation : null,
    keywords_uk: translatedLanguage === "uk" && translationPresent ? translatedKeywords : [],
    title_en: translatedLanguage === "en" && translationPresent ? titleTranslation : null,
    abstract_en: translatedLanguage === "en" && translationPresent ? abstractTranslation : null,
    keywords_en: translatedLanguage === "en" && translationPresent ? translatedKeywords : [],
    references_list: rawReferences,
    doi, volume, issue, pages,
    review_kind: reviewKind,
    review_details: reviewDetails,
    ...disclosures,
  };
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
  const { token, editor } = await requireEditor();
  const id = value(data, "id", 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin");

  // HTML "required" is just a convenience. Every declaration is verified on the server.
  const checks = {
    authors: data.get("check_authors") === "yes",
    ethics: data.get("check_ethics") === "yes",
    privacy: data.get("check_privacy") === "yes",
    accuracy: data.get("check_accuracy") === "yes",
  };
  if (!Object.values(checks).every(Boolean)) {
    redirect(`/admin/articles/${id}?error=checks`);
  }

  const article = await getEditorArticle(id, token);
  if (!article || article.status !== "draft" ||
      !article.title || !article.abstract || !article.authors?.length || !article.keywords?.length) {
    redirect("/admin?error=locked");
  }

  if (!article.review_kind ||
      (article.review_kind === "external" && (article.review_details?.trim().length ?? 0) < 20)) {
    redirect(`/admin/articles/${id}?error=review`);
  }

  const publishedAt = new Date().toISOString().slice(0, 10);
  const response = await jrsFetch(
    `/rest/v1/jrs_articles?id=eq.${id}&status=eq.draft`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        status: "published",
        published_at: publishedAt,
        published_by: editor.id,
        publication_checks: checks,
        updated_at: new Date().toISOString(),
      }),
    },
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


/**
 * Append an official post-publication notice without altering the scientific
 * record. Only authorized editors can use this action; PostgreSQL independently
 * verifies the editor membership, author identity, and published parent.
 */
export async function issueEditorialNoticeAction(data: FormData) {
  const { token, editor } = await requireEditor();
  const id = value(data, "article_id", 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin");

  const kind = value(data, "kind", 40);
  const title = value(data, "title", 220);
  const explanation = value(data, "explanation", 10000);
  const acknowledged = data.get("confirm_public") === "yes";
  const back = `/admin/articles/${id}`;

  if (!["correction", "concern", "retraction"].includes(kind)
      || title.trim().length < 10 || explanation.trim().length < 40 || !acknowledged) {
    redirect(`${back}?error=notice-fields`);
  }

  const article = await getEditorArticle(id, token);
  if (!article || article.status !== "published") redirect("/admin?error=locked");

  const response = await jrsFetch("/rest/v1/jrs_article_notices?select=id", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({
      article_id: article.id,
      kind,
      title,
      explanation,
      issued_by: editor.id,
    }),
  }, token);

  if (!response.ok) redirect(`${back}?error=notice-save`);
  const entries = await response.json() as { id: string }[];
  if (!entries[0]?.id) redirect(`${back}?error=notice-save`);

  revalidatePath(`/publications/${article.slug}`);
  revalidatePath("/notices");
  revalidatePath(`/notices/${entries[0].id}`);
  redirect(`${back}?noticeAdded=1`);
}

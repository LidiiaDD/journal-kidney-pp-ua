import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Publication, PublicationAuthor, PublicationType } from "./publications";

const ACCESS_COOKIE = "jrs_access";
const REFRESH_COOKIE = "jrs_refresh";

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  type: PublicationType;
  language: "uk" | "en";
  authors: PublicationAuthor[];
  keywords: string[];
  status: "draft" | "published";
  published_at: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseSession = { access_token: string; refresh_token: string; expires_in: number };
type SupabaseUser = { id: string; email?: string };

export function isJrsConfigured(): boolean {
  return Boolean(process.env.JRS_SUPABASE_URL && process.env.JRS_SUPABASE_PUBLISHABLE_KEY);
}

function config(): { origin: string; key: string } {
  const origin = (process.env.JRS_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.JRS_SUPABASE_PUBLISHABLE_KEY || "";
  if (!origin || !key) throw new Error("JRS backend is not configured");
  const url = new URL(origin);
  if (url.protocol !== "https:" || !/^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname) || url.pathname !== "/") {
    throw new Error("Invalid JRS Supabase project URL");
  }
  return { origin, key };
}

export async function jrsFetch(path: string, options: RequestInit = {}, accessToken?: string) {
  const { origin, key } = config();
  const headers = new Headers(options.headers);
  headers.set("apikey", key);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return fetch(`${origin}${path}`, { ...options, headers, cache: "no-store" });
}

export async function jrsJson<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const response = await jrsFetch(path, options, accessToken);
  if (!response.ok) throw new Error(`JRS data request failed (${response.status})`);
  return response.json() as Promise<T>;
}

const cookieSettings = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function saveSession(session: SupabaseSession) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, session.access_token, {
    ...cookieSettings,
    maxAge: Math.max(60, session.expires_in - 20),
  });
  jar.set(REFRESH_COOKIE, session.refresh_token, { ...cookieSettings, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value || null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value || null;
}

export async function verifyEditor(accessToken: string): Promise<SupabaseUser | null> {
  const response = await jrsFetch("/auth/v1/user", {}, accessToken);
  if (!response.ok) return null;
  const user = (await response.json()) as SupabaseUser;
  if (!/^[0-9a-f-]{36}$/i.test(user.id || "")) return null;
  const editors = await jrsJson<{ user_id: string }[]>(
    `/rest/v1/jrs_editors?user_id=eq.${user.id}&select=user_id&limit=1`,
    {},
    accessToken
  );
  return editors.some((editor) => editor.user_id === user.id) ? user : null;
}

export async function requireEditor() {
  if (!isJrsConfigured()) redirect("/admin/login?error=setup");
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let editor: SupabaseUser | null = null;
  try {
    editor = await verifyEditor(token);
  } catch {
    // Fail closed if identity or authorization cannot be confirmed.
  }
  if (!editor) redirect("/admin/login?error=auth");
  return { editor, token };
}

export async function signInEditor(email: string, password: string): Promise<boolean> {
  if (!isJrsConfigured()) return false;
  const response = await jrsFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return false;
  const session = (await response.json()) as SupabaseSession;
  if (!session.access_token || !session.refresh_token) return false;
  const editor = await verifyEditor(session.access_token);
  if (!editor) return false;
  await saveSession(session);
  return true;
}

export function rowToPublication(row: ArticleRow): Publication {
  return {
    slug: row.slug,
    title: row.title,
    abstract: row.abstract,
    type: row.type,
    language: row.language,
    authors: row.authors,
    keywords: row.keywords,
    publishedAt: row.published_at || row.created_at.slice(0, 10),
    ...(row.pdf_path ? { pdfUrl: `/publications/${row.slug}/pdf` } : {}),
  };
}

export async function listPublishedArticles(): Promise<Publication[]> {
  if (!isJrsConfigured()) return [];
  try {
    const data = await jrsJson<ArticleRow[]>(
      "/rest/v1/jrs_articles?select=*&status=eq.published&order=published_at.desc,created_at.desc&limit=200"
    );
    return data.map(rowToPublication);
  } catch {
    return [];
  }
}

export async function getPublishedArticle(slug: string): Promise<Publication | null> {
  if (!isJrsConfigured() || !/^[a-z0-9-]{3,100}$/.test(slug)) return null;
  try {
    const data = await jrsJson<ArticleRow[]>(
      `/rest/v1/jrs_articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*&limit=1`
    );
    return data[0] ? rowToPublication(data[0]) : null;
  } catch {
    return null;
  }
}

export async function getPublishedRow(slug: string): Promise<ArticleRow | null> {
  if (!isJrsConfigured() || !/^[a-z0-9-]{3,100}$/.test(slug)) return null;
  const data = await jrsJson<ArticleRow[]>(
    `/rest/v1/jrs_articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*&limit=1`
  );
  return data[0] || null;
}

export async function listEditorArticles(token: string): Promise<ArticleRow[]> {
  return jrsJson<ArticleRow[]>(
    "/rest/v1/jrs_articles?select=*&order=updated_at.desc&limit=300",
    {},
    token
  );
}

export async function getEditorArticle(id: string, token: string): Promise<ArticleRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await jrsJson<ArticleRow[]>(
    `/rest/v1/jrs_articles?id=eq.${id}&select=*&limit=1`, {}, token
  );
  return rows[0] || null;
}

export function publicJrsOrigin() {
  return config().origin;
}

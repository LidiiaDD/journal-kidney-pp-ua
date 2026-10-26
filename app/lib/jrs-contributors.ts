import { createHash } from "node:crypto";
import type { Publication, PublicationAuthor } from "./publications";

export type AuthorEntry = {
  key: string;
  name: string;
  orcid?: string;
  affiliations: string[];
  articles: Publication[];
  initial: string;
};

const clean = (s: string): string => s.normalize("NFKC").replace(/\s+/g, " ").trim();
const folded = (s: string): string => clean(s).toLocaleLowerCase("uk-UA");

export function verifiedOrcidShape(raw?: string): string | undefined {
  if (!raw) return undefined;
  const orcid = clean(raw).replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, "").toUpperCase();
  if (!/^(?:\d{4}-){3}\d{3}[\dX]$/.test(orcid)) return undefined;
  const digits = orcid.replace(/-/g, "");
  let total = 0;
  for (const char of digits.slice(0, 15)) total = (total + Number(char)) * 2;
  const checksum = (12 - (total % 11)) % 11;
  if ((checksum === 10 ? "X" : String(checksum)) !== digits[15]) return undefined;
  return orcid;
}

/**
 * This is a bibliographic contributor index, NOT a verified identity database.
 * Match only exact valid ORCID identifiers or identical normalized name AND
 * affiliation (for author records without an ORCID). Ambiguity creates separate
 * records instead of silently merging different people.
 */
export function authorKey(author: PublicationAuthor): string {
  const orcid = verifiedOrcidShape(author.orcid);
  const name = folded(author.name);
  const affiliation = folded(author.affiliation || "");
  const identity = orcid ? `orcid:${orcid}` : `unverified:${name}|affiliation:${affiliation}`;
  return createHash("sha256").update(identity).digest("hex").slice(0, 24);
}

export function authorHref(author: PublicationAuthor): string {
  return `/contributors/${authorKey(author)}`;
}

/** Same bibliographic identity and grouping as the original-language index. */
export function internationalAuthorHref(author: PublicationAuthor): string {
  return `/en/contributors/${authorKey(author)}`;
}

export function authorEntries(articles: readonly Publication[]): AuthorEntry[] {
  const map = new Map<string, AuthorEntry>();
  for (const article of articles) {
    for (const author of article.authors) {
      if (!clean(author.name)) continue;
      const key = authorKey(author);
      let entry = map.get(key);
      if (!entry) {
        const name = clean(author.name);
        entry = { key, name, orcid: verifiedOrcidShape(author.orcid), affiliations: [], articles: [], initial: name[0]?.toLocaleUpperCase("uk-UA") || "?" };
        map.set(key, entry);
      }
      const aff = clean(author.affiliation || "");
      if (aff && !entry.affiliations.includes(aff)) entry.affiliations.push(aff);
      if (!entry.articles.some(existing => existing.slug === article.slug)) entry.articles.push(article);
    }
  }
  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "uk-UA", { sensitivity: "base" })
    || a.key.localeCompare(b.key)
  );
}

export function findAuthorEntry(articles: readonly Publication[], key: string): AuthorEntry | undefined {
  if (!/^[0-9a-f]{24}$/.test(key)) return undefined;
  return authorEntries(articles).find(entry => entry.key === key);
}

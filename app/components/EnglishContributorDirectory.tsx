"use client";

import { useMemo, useState } from "react";

export type EnglishContributorCard = {
  key: string;
  name: string;
  initial: string;
  affiliation: string;
  orcid?: string;
  publicationCount: number;
};

export default function EnglishContributorDirectory({ entries }: { entries: EnglishContributorCard[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("all");
  const [order, setOrder] = useState<"alphabet" | "papers">("alphabet");
  const initials = [...new Set(entries.map(entry => entry.initial))]
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  const visible = useMemo(() => {
    const needle = query.trim().normalize("NFKC").toLocaleLowerCase("en");
    const matched = entries.filter(entry => {
      if (letter !== "all" && entry.initial !== letter) return false;
      if (!needle) return true;
      return [entry.name, entry.affiliation, entry.orcid || ""]
        .join(" ").normalize("NFKC").toLocaleLowerCase("en").includes(needle);
    });
    return matched.sort((a, b) => order === "papers"
      ? b.publicationCount - a.publicationCount || a.name.localeCompare(b.name, "en")
      : a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.key.localeCompare(b.key));
  }, [entries, query, letter, order]);

  function clear() { setQuery(""); setLetter("all"); setOrder("alphabet"); }

  if (!entries.length) {
    return (
      <div className="jrs-en-contrib-empty">
        <div className="jrs-en-contrib-symbol" aria-hidden="true"><span>J</span><span>R</span><span>S</span></div>
        <span className="jrs-en-eyebrow">JRS / RESEARCH COMMUNITY</span>
        <h2>Every name begins with published research.</h2>
        <p>This index is generated solely from the journal’s public article records. There are no published contributor entries yet. We do not create placeholder researchers or biographies.</p>
        <a href="/en/publications">Browse the research catalogue ↗</a>
      </div>
    );
  }

  return (
    <div className="jrs-en-contrib-directory">
      <div className="jrs-en-contrib-filters">
        <label>Find a contributor
          <input type="search" autoComplete="off" placeholder="Name, institution or ORCID…"
            value={query} onChange={event => setQuery(event.target.value)} />
        </label>
        <label>Order
          <select value={order} onChange={event => setOrder(event.target.value as "alphabet" | "papers")}>
            <option value="alphabet">Name A–Z</option>
            <option value="papers">Number of publications</option>
          </select>
        </label>
      </div>
      <nav className="jrs-en-contrib-letters" aria-label="Contributor initial filter">
        <button type="button" onClick={() => setLetter("all")} aria-pressed={letter === "all"}>All</button>
        {initials.map(initial => (
          <button type="button" key={initial} aria-pressed={letter === initial}
            onClick={() => setLetter(initial)}>{initial}</button>
        ))}
      </nav>
      <div className="jrs-en-contrib-results">
        <span role="status" aria-live="polite">{visible.length} of {entries.length} bibliographic contributor records</span>
        {(query || letter !== "all" || order !== "alphabet") &&
          <button type="button" onClick={clear}>Clear filters</button>}
      </div>
      {visible.length ? (
        <div className="jrs-en-contrib-cards">
          {visible.map(entry => (
            <a href={`/en/contributors/${entry.key}`} key={entry.key} className="jrs-en-contrib-card">
              <span className="jrs-en-contrib-card-heading"><span>JRS / CONTRIBUTOR</span><span aria-hidden="true">↗</span></span>
              <span className="jrs-en-contrib-monogram" aria-hidden="true">{entry.initial}</span>
              <strong className="jrs-en-contrib-name">{entry.name}</strong>
              <span className="jrs-en-contrib-affiliation">{entry.affiliation || "Affiliation not reported"}</span>
              <span className="jrs-en-contrib-card-footer">
                <span>{entry.orcid ? "ORCID listed" : "No ORCID listed"}</span>
                <b>{entry.publicationCount} {entry.publicationCount === 1 ? "article" : "articles"}</b>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="jrs-en-contrib-zero">
          <h2>No matching contributor records.</h2>
          <p>Try another name or affiliation, or remove the initial filter.</p>
          <button type="button" onClick={clear}>Show all contributors</button>
        </div>
      )}
    </div>
  );
}

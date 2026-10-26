"use client";

import { useMemo, useState } from "react";

export type ContributorIndexItem = {
  key: string;
  name: string;
  initial: string;
  affiliation: string;
  orcid?: string;
  publications: number;
  mostRecentYear: string;
};

export default function ContributorDirectory({ items }: { items: ContributorIndexItem[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("all");
  const [sort, setSort] = useState<"alphabet" | "publications">("alphabet");
  const initials = [...new Set(items.map(item => item.initial))].sort((a, b) => a.localeCompare(b, "uk-UA"));

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("uk-UA");
    const out = items.filter(item => {
      if (letter !== "all" && item.initial !== letter) return false;
      if (!needle) return true;
      return [item.name, item.affiliation, item.orcid || ""]
        .join(" ").toLocaleLowerCase("uk-UA").includes(needle);
    });
    if (sort === "publications") return out.sort((a,b) =>
      b.publications-a.publications || a.name.localeCompare(b.name,"uk-UA"));
    return out.sort((a,b) => a.name.localeCompare(b.name,"uk-UA"));
  }, [items, query, letter, sort]);

  if (!items.length) {
    return (
      <div className="contributors-empty">
        <div className="contributors-empty-art" aria-hidden="true"><span>J</span><span>R</span><span>S</span></div>
        <span className="contributors-eyebrow">JRS / RESEARCH COMMUNITY</span>
        <h2>Імена з’являться разом із дослідженнями.</h2>
        <p>Покажчик наповнюється з опублікованих статей. Зараз у відкритому архіві немає авторських записів — ми не створюємо демонстраційних профілів.</p>
        <a href="/publications">До каталогу статей ↗</a>
      </div>
    );
  }

  return (
    <div className="contributors-directory">
      <div className="contributors-directory-tools">
        <label>Пошук авторів і установ
          <input type="search" autoComplete="off" value={query}
            placeholder="Прізвище, ім’я, афіліація, ORCID…"
            onChange={event => setQuery(event.target.value)}/>
        </label>
        <label>Сортування
          <select value={sort} onChange={event => setSort(event.target.value as "alphabet" | "publications")}>
            <option value="alphabet">За алфавітом</option>
            <option value="publications">За кількістю статей</option>
          </select>
        </label>
      </div>

      <nav className="contributors-letters" aria-label="Фільтр за першою літерою">
        <button type="button" aria-pressed={letter==="all"} onClick={()=>setLetter("all")}>Усі</button>
        {initials.map(initial=><button type="button" key={initial} aria-pressed={letter===initial}
          onClick={()=>setLetter(initial)}>{initial}</button>)}
      </nav>

      <div className="contributors-result-row">
        <span role="status" aria-live="polite">Знайдено: {filtered.length} із {items.length} авторських записів</span>
        {(letter!=="all" || query) &&
          <button type="button" onClick={()=>{setLetter("all");setQuery("");}}>Очистити фільтри</button>}
      </div>

      {filtered.length ? <div className="contributors-grid">
        {filtered.map(item=><a href={`/contributors/${item.key}`} key={item.key} className="contributors-card">
          <span className="contributors-card-top">
            <span>JRS / CONTRIBUTOR</span>
            <span aria-hidden="true">↗</span>
          </span>
          <span className="contributors-monogram" aria-hidden="true">{item.initial}</span>
          <span className="contributors-card-name">{item.name}</span>
          <span className="contributors-card-affiliation">{item.affiliation || "Афіліація не вказана"}</span>
          <span className="contributors-card-bottom">
            <span>{item.orcid ? "ORCID зазначено" : "Без ORCID"}</span>
            <strong>{item.publications} {item.publications===1 ? "стаття" : "статей"}</strong>
          </span>
        </a>)}
      </div> : <div className="contributors-no-results">
        <h2>За вашим запитом авторських записів немає.</h2>
        <p>Спробуйте іншу частину імені, назву установи або зніміть літерний фільтр.</p>
        <button type="button" onClick={()=>{setLetter("all");setQuery("");}}>Показати всіх авторів</button>
      </div>}
    </div>
  );
}

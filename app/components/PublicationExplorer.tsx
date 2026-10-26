"use client";

import { useMemo, useState } from "react";
import type { Publication, PublicationType } from "@/app/lib/publications";
import { researchTopics, topicsForPublication, type TopicSlug } from "@/app/lib/research-topics";
import {
  formatPublicationDate,
  publicationTypeLabels,
} from "@/app/lib/publications";

type Props = { items: Publication[]; initialTopic?: TopicSlug | "all" };

export default function PublicationExplorer({ items, initialTopic = "all" }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [topic, setTopic] = useState<TopicSlug | "all">(initialTopic);
  const topicName = researchTopics.find(item => item.slug === topic)?.title;

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.type))),
    [items]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("uk-UA");
    return items.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (topic !== "all" && !topicsForPublication(item).includes(topic)) return false;
      if (!needle) return true;

      const searchable = [
        item.title,
        item.abstract,
        ...item.authors.map((author) => author.name),
        ...item.keywords,
        ...(item.translations?.uk ? [item.translations.uk.title, item.translations.uk.abstract, ...item.translations.uk.keywords] : []),
        ...(item.translations?.en ? [item.translations.en.title, item.translations.en.abstract, ...item.translations.en.keywords] : []),
      ].join(" ").toLocaleLowerCase("uk-UA");
      return searchable.includes(needle);
    });
  }, [items, query, type, topic]);

  if (items.length === 0) {
    return (
      <div className="pub-empty">
        <span className="pub-empty-mark" aria-hidden="true">JRS</span>
        <p className="pub-empty-label">Архів формується</p>
        <h3>{topicName ? `У напрямі «${topicName}» публікацій поки немає` : "Перші публікації готуються"}</h3>
        <p>
          У каталозі з’являтимуться лише матеріали, які справді пройшли
          редакційний розгляд і були опубліковані. Ми не розміщуємо
          демонстраційні або вигадані наукові статті.
        </p>
        <div className="pub-empty-actions">
          <a href="/topics">Тематичний атлас ↗</a>
          <a href="/authors">Правила для авторів ↗</a>
          <a href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20%D0%BF%D0%BE%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F%20%D1%80%D1%83%D0%BA%D0%BE%D0%BF%D0%B8%D1%81%D1%83">
            Подати рукопис ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-explorer">
      <div className="pub-topic-context">
        <span>Наукова навігація</span>
        <a href="/topics">Переглянути всі 8 напрямів ↗</a>
      </div>
      <div className="pub-controls">
        <label className="pub-search">
          <span>Пошук у публікаціях</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Назва, автор, ключове слово…"
          />
        </label>
        <label className="pub-filter">
          <span>Науковий напрям</span>
          <select value={topic} onChange={event => setTopic(event.target.value as TopicSlug | "all")}>
            <option value="all">Усі напрями</option>
            {researchTopics.map(item => (
              <option key={item.slug} value={item.slug}>{item.title}</option>
            ))}
          </select>
        </label>
        <label className="pub-filter">
          <span>Тип матеріалу</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as PublicationType | "all")}
          >
            <option value="all">Усі типи</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {publicationTypeLabels[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="pub-result-count" role="status">
        Знайдено матеріалів: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <div className="pub-no-results">
          <h3>За вашим запитом нічого не знайдено</h3>
          <p>Спробуйте інший пошуковий запит або змініть тип матеріалу.</p>
          <button type="button" onClick={() => { setQuery(""); setType("all"); setTopic("all"); }}>
            Очистити фільтри
          </button>
        </div>
      ) : (
        <div className="pub-list">
          {filtered.map((item) => (
            <article className="pub-card" key={item.slug}>
              <div className="pub-card-meta">
                <span>{publicationTypeLabels[item.type]}</span>
                <time dateTime={item.publishedAt}>{formatPublicationDate(item.publishedAt)}</time>
              </div>
              <h3><a href={`/publications/${item.slug}`}>{item.title}</a></h3>
              <p className="pub-authors">{item.authors.map((author) => author.name).join(", ")}</p>
              <p className="pub-card-abstract">{item.abstract}</p>
              <div className="pub-card-footer">
                <a href={`/publications/${item.slug}`}>Читати анотацію ↗</a>
                {item.pdfUrl && (
                  <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                    PDF ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

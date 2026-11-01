"use client";

import { useMemo, useState } from "react";
import type { Publication } from "@/app/lib/publications";
import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { articleUrl, toBibtex, toRis } from "@/app/lib/citations";
import { clearReadingListIfUnchanged, removeUnavailableReadingItems, useReadingList } from "@/app/lib/reading-list";
import BookmarkButton from "@/app/components/BookmarkButton";

export default function ReadingLibrary({ articles }: { articles: Publication[] }) {
  const saved = useReadingList();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"saved" | "newest" | "title">("saved");
  const [notice, setNotice] = useState("");
  const [manualLinks, setManualLinks] = useState("");
  const [confirmClear, setConfirmClear] = useState<readonly string[] | null>(null);

  const available = useMemo(() => {
    const bySlug = new Map(articles.map(article => [article.slug, article]));
    return saved.flatMap(slug => {
      const article = bySlug.get(slug);
      return article ? [article] : [];
    });
  }, [articles, saved]);

  const unavailable = saved.length - available.length;
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("uk-UA");
    const filtered = available.filter(article => {
      if (!needle) return true;
      const translated = Object.values(article.translations ?? {}).flatMap(entry =>
        entry ? [entry.title, ...entry.keywords] : []);
      return [
        article.title, article.abstract, ...article.keywords,
        ...article.authors.map(author => author.name), ...translated,
      ].join(" ").toLocaleLowerCase("uk-UA").includes(needle);
    });
    if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title, "uk"));
    if (sort === "newest") filtered.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return filtered;
  }, [available, query, sort]);

  async function copyLinks() {
    if (!available.length) return;
    const lines = available.map((article, index) =>
      `${index + 1}. ${article.title}\n${articleUrl(article)}`);
    const text = lines.join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setManualLinks("");
      setNotice("Перелік статей і посилань скопійовано.");
    } catch {
      setManualLinks(text);
      setNotice("Автоматичне копіювання недоступне. Виділіть перелік нижче й скопіюйте вручну.");
    }
  }

  function download(format: "ris" | "bib") {
    if (!available.length) return;
    const text = available.map(article =>
      format === "ris" ? toRis(article, article.language) : toBibtex(article, article.language)
    ).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `JRS-my-library.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Allow browsers that start downloads asynchronously to resolve the blob URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setNotice(format === "ris" ? "Файл RIS підготовлено." : "Файл BibTeX підготовлено.");
  }

  function removeMissing() {
    if (!removeUnavailableReadingItems(articles.map(article => article.slug))) {
      setNotice("Не вдалося оновити закладки в браузері.");
    } else {
      setNotice("Недоступні посилання прибрано.");
    }
  }

  function clear() {
    if (!confirmClear) return;
    const result = clearReadingListIfUnchanged(confirmClear);
    setConfirmClear(null);
    if (result === "changed") {
      setNotice("Закладки змінилися в іншій вкладці. Перевірте список і підтвердьте очищення ще раз.");
      return;
    }
    if (result === "unavailable") {
      setNotice("Не вдалося очистити бібліотеку.");
      return;
    }
    setManualLinks("");
    setNotice("Усі закладки очищено.");
  }

  return (
    <div className="reading-library">
      <div className="reading-introduction">
        <div>
          <span className="reading-eyebrow">CURATED BY YOU · JRS</span>
          <h2>Зберігайте знання, до яких хочеться повернутися.</h2>
          <p>Створіть власну колекцію публікацій. Додавайте матеріали закладкою з каталогу або сторінки статті; вони з'являться тут автоматично.</p>
        </div>
        <div className="reading-tally" aria-label="Кількість збережених доступних статей">
          <span className="reading-tally-number">{available.length}</span>
          <span className="reading-tally-label">статей у вашій добірці</span>
          <span className="reading-tally-divider" />
          <span className="reading-tally-detail">Моя наукова бібліотека</span>
        </div>
      </div>

      <div className="reading-notice" role="note">
        <span className="reading-notice-icon" aria-hidden="true">✳</span>
        <div><strong>Ваші закладки залишаються у вашому браузері.</strong>
          <p>Без облікового запису й передачі вибору на сервер. Бібліотека не синхронізується між пристроями й може зникнути після очищення даних браузера або використання приватного режиму.</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="reading-empty">
          <div className="reading-empty-art" aria-hidden="true"><span>J</span><span>R</span><span>S</span></div>
          <span className="reading-eyebrow">YOUR READING SHELF</span>
          <h3>Ваша добірка починається з першої статті.</h3>
          <p>{articles.length
            ? "Перейдіть до архіву, оберіть публікацію та натисніть «Зберегти». Вона одразу з’явиться тут."
            : "Журнал готує перші публікації. Щойно вони з’являться в архіві, ви зможете збирати власну наукову добірку."}</p>
          <div className="reading-empty-actions">
            <a href="/publications">До каталогу публікацій ↗</a>
            <a href="/topics">Дослідницький атлас ↗</a>
          </div>
        </div>
      ) : (
        <>
          {unavailable > 0 && (
            <div className="reading-missing" role="status">
              <p>{unavailable} збережених посилань зараз немає серед публічно доступних статей. Чернетки ніколи не відображаються в бібліотеці.</p>
              <button type="button" onClick={removeMissing}>Прибрати недоступні посилання</button>
            </div>
          )}
          {available.length > 0 && (
            <>
              <div className="reading-toolbar">
                <label>Знайти у своїй бібліотеці
                  <input type="search" value={query} onChange={event => setQuery(event.target.value)}
                    placeholder="Назва, автор, ключове слово…" />
                </label>
                <label>Порядок
                  <select value={sort} onChange={event => setSort(event.target.value as "saved" | "newest" | "title")}>
                    <option value="saved">Нещодавно збережені</option>
                    <option value="newest">За датою публікації</option>
                    <option value="title">За назвою</option>
                  </select>
                </label>
              </div>

              <p className="reading-results" role="status">Показано {visible.length} із {available.length} збережених статей</p>
              {visible.length ? (
                <div className="reading-stack">
                  {visible.map((article, index) => (
                    <article key={article.slug} className="reading-entry">
                      <span className="reading-entry-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className="reading-entry-main">
                        <div className="reading-entry-meta">
                          <span>{publicationTypeLabels[article.type]}</span>
                          <time dateTime={article.publishedAt}>{formatPublicationDate(article.publishedAt)}</time>
                        </div>
                        <h3><a href={`/publications/${article.slug}`}>{article.title}</a></h3>
                        <p>{article.authors.map(author => author.name).join(", ")}</p>
                        <div className="reading-entry-actions">
                          <a href={`/publications/${article.slug}`}>Відкрити статтю ↗</a>
                          {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">PDF ↗</a>}
                          <BookmarkButton slug={article.slug} compact />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="reading-no-results">У вашій добірці немає матеріалів за цим запитом. <button type="button" onClick={() => setQuery("")}>Скинути пошук</button></div>
              )}

              <div className="reading-export">
                <span className="reading-eyebrow">TAKE YOUR READING LIST WITH YOU</span>
                <h3>Ваш список — у зручному форматі.</h3>
                <p>Експортуйте всі доступні статті зі своєї бібліотеки для подальшої роботи. Бібліографічні записи формуються з опублікованих метаданих і потребують перевірки перед використанням.</p>
                <div className="reading-export-buttons">
                  <button type="button" onClick={() => void copyLinks()}>Копіювати посилання</button>
                  <button type="button" onClick={() => download("ris")}>Експорт RIS</button>
                  <button type="button" onClick={() => download("bib")}>Експорт BibTeX</button>
                </div>
                {manualLinks && (
                  <label className="reading-manual-copy mt-4 block text-sm">Перелік для ручного копіювання
                    <textarea readOnly rows={5} value={manualLinks}
                      className="mt-2 w-full min-w-0 box-border resize-y border border-white/40 bg-white p-3 text-slate-900"
                      aria-label="Перелік статей і посилань для ручного копіювання"
                      onFocus={event => event.currentTarget.select()} />
                  </label>
                )}
                <div className="reading-library-actions">
                  {confirmClear ? (
                    <div className="reading-confirm">
                      <span>Видалити всі локальні закладки?</span>
                      <button type="button" onClick={clear}>Так, очистити</button>
                      <button type="button" onClick={() => setConfirmClear(null)}>Скасувати</button>
                    </div>
                  ) : <button type="button" onClick={() => setConfirmClear([...saved])}>Очистити мою бібліотеку</button>}
                </div>
              </div>
            </>
          )}
        </>
      )}
      <p className="reading-live-notice" role="status" aria-live="polite">{notice}</p>
    </div>
  );
}

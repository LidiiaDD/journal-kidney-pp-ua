"use client";

import { useMemo, useState } from "react";
import {
  findGuide,
  manuscriptGuides,
  sharedChecks,
  type ChecklistItem,
  type ManuscriptKind,
} from "@/app/lib/manuscript-guide";

const editorEmail = "editor@kidney.pp.ua";

export default function ManuscriptNavigator() {
  const [kind, setKind] = useState<ManuscriptKind>("observational");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [manualCopy, setManualCopy] = useState("");
  const guide = findGuide(kind);

  const groups = useMemo(() => [
    { id: "shared", title: "Основа рукопису", subtitle: "Спільне для всіх матеріалів", items: sharedChecks },
    { id: "specific", title: "Вимоги до вашого дизайну", subtitle: guide.english, items: guide.checks },
  ], [guide]);

  function itemKey(item: ChecklistItem, group: string) {
    return group === "shared" ? item.id : `${kind}:${item.id}`;
  }

  const total = sharedChecks.length + guide.checks.length;
  const completed = groups.reduce((count, group) =>
    count + group.items.filter(item => checked[itemKey(item, group.id)]).length, 0);
  const percent = Math.round(completed / total * 100);
  const remaining = groups.flatMap(group =>
    group.items.filter(item => !checked[itemKey(item, group.id)]).map(item => item.title));

  function setItem(item: ChecklistItem, group: string, next: boolean) {
    setChecked(previous => ({ ...previous, [itemKey(item, group)]: next }));
    setFeedback("");
    setManualCopy("");
  }

  async function copyRemaining() {
    const text = [
      "JRS — Навігатор рукопису",
      `Тип: ${guide.label}`,
      `Самоперевірка: ${completed} із ${total}`,
      "Ще варто перевірити:",
      ...(remaining.length ? remaining.map((item, index) => `${index + 1}. ${item}`) : ["Усі пункти позначено. Перед поданням перегляньте файл повторно."]),
      "https://journal.kidney.pp.ua/manuscript-checklist",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setManualCopy("");
      setFeedback("Список скопійовано.");
    } catch {
      setManualCopy(text);
      setFeedback("Автоматичне копіювання недоступне. Виділіть список нижче та скопіюйте вручну.");
    }
  }

  const mailto = `mailto:${editorEmail}?subject=${encodeURIComponent("JRS — подання рукопису")}`;

  return (
    <div className="manu-studio">
      <div className="manu-intro-grid">
        <div className="manu-intro-copy">
          <span className="manu-overline">01 / DISCOVER YOUR FORMAT</span>
          <h2>Який матеріал ви готуєте?</h2>
          <p>Оберіть тип роботи. Навігатор покаже відповідні орієнтири щодо опису методів, результатів та необхідних декларацій.</p>
        </div>
        <div className="manu-privacy">
          <span aria-hidden="true" className="manu-privacy-symbol">✳</span>
          <strong>Приватна самоперевірка</strong>
          <p>Позначки обробляються лише у вашому браузері. Ми не просимо завантажувати рукописи чи медичні дані й не передаємо ці відмітки до редакції.</p>
        </div>
      </div>

      <div className="manu-choose" role="group" aria-label="Тип наукового рукопису">
        {manuscriptGuides.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`manu-kind${kind === item.id ? " is-current" : ""}`}
            aria-pressed={kind === item.id}
            onClick={() => { setKind(item.id); setFeedback(""); setManualCopy(""); }}
          >
            <span className="manu-kind-id">{String(index + 1).padStart(2, "0")}</span>
            <span className="manu-kind-title">{item.label}</span>
            <span className="manu-kind-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      <div className="manu-status" aria-live="polite">
        <div className="manu-status-copy">
          <span className="manu-overline">02 / PREPARATION CHECK</span>
          <h2>{guide.label}</h2>
          <p>{guide.description}</p>
          {guide.guidanceHref && (
            <a className="manu-guideline" href={guide.guidanceHref} target="_blank" rel="noopener noreferrer">
              Переглянути рекомендації {guide.guidanceName} ↗
            </a>
          )}
          {guide.guidanceNote && <p className="manu-guideline-note">{guide.guidanceNote}</p>}
        </div>
        <div className="manu-progress-panel">
          <div className="manu-progress-top">
            <span>Прогрес самоперевірки</span>
            <strong>{completed} <i>/ {total}</i></strong>
          </div>
          <div className="manu-progress-track" role="progressbar"
            aria-label="Частка перевірених пунктів" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={percent}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <p>{completed === total
            ? "Усі пункти позначено. Це не означає автоматичного прийняття рукопису."
            : `Позначено ${percent}% пунктів. Це не оцінка наукової якості роботи.`}</p>
        </div>
      </div>

      <div className="manu-checklist">
        {groups.map((group, index) => (
          <section className="manu-check-group" key={group.id} aria-labelledby={`manu-group-${group.id}`}>
            <div className="manu-group-heading">
              <span className="manu-group-number">0{index + 1}</span>
              <div>
                <h3 id={`manu-group-${group.id}`}>{group.title}</h3>
                <p>{group.subtitle}</p>
              </div>
            </div>
            <div className="manu-group-items">
              {group.items.map(item => {
                const isChecked = Boolean(checked[itemKey(item, group.id)]);
                return (
                  <label key={item.id} className={`manu-check${isChecked ? " is-checked" : ""}`}>
                    <input type="checkbox" checked={isChecked}
                      onChange={event => setItem(item, group.id, event.target.checked)} />
                    <span className="manu-check-indicator" aria-hidden="true">{isChecked ? "✓" : ""}</span>
                    <span className="manu-check-text">
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="manu-finale">
        <div className="manu-finale-top">
          <span className="manu-overline">03 / YOUR NEXT STEP</span>
          <h2>{completed === total ? "Перевірку позначено завершеною." : "Поверніться до пунктів, що залишилися."}</h2>
          <p>
            {completed === total
              ? "Перечитайте фінальний файл, переконайтеся, що всі декларації коректні, і лише тоді надсилайте матеріал на редакційний розгляд."
              : `Залишилося ${total - completed} пунктів. Ви можете зберегти їх список або роздрукувати чекліст для роботи над рукописом.`}
          </p>
        </div>
        <div className="manu-finale-actions">
          <button type="button" className="manu-action-neutral" onClick={() => void copyRemaining()}>
            Копіювати незавершені пункти
          </button>
          <button type="button" className="manu-action-neutral" onClick={() => window.print()}>
            Роздрукувати чекліст
          </button>
          <a className="manu-action-primary" href={mailto}>Написати в редакцію ↗</a>
        </div>
        <div className="manu-finale-footer">
          <p role="status" aria-live="polite">{feedback}</p>
          <button type="button" onClick={() => { setChecked({}); setManualCopy(""); setFeedback("Позначки очищено."); }}>
            Очистити всі позначки
          </button>
        </div>
        {manualCopy && (
          <textarea
            aria-label="Список пунктів для ручного копіювання"
            readOnly
            value={manualCopy}
            rows={Math.min(10, Math.max(4, manualCopy.split("\n").length))}
            onFocus={event => event.currentTarget.select()}
            style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 14, padding: 12, fontSize: 16, lineHeight: 1.5 }}
          />
        )}
      </div>
      <p className="manu-disclaimer">
        Це довідковий інструмент самоперевірки, а не офіційна сертифікація якості,
        автоматичне рецензування чи гарантія публікації. Для специфічних дизайнів
        перевіряйте також актуальні повні міжнародні рекомендації.
      </p>
    </div>
  );
}

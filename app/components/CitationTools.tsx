"use client";

import { useState } from "react";

type Props = { citation: string; url: string };

export default function CitationTools({ citation, url }: Props) {
  const [notice, setNotice] = useState("");
  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(message);
    } catch {
      setNotice("Не вдалося скопіювати. Виділіть текст цитування вручну.");
    }
  }

  return (
    <div className="pub-citation-actions">
      <button type="button" onClick={() => void copy(citation, "Цитування скопійовано.")}>
        Скопіювати цитування
      </button>
      <button type="button" onClick={() => void copy(url, "Посилання скопійовано.")}>
        Скопіювати посилання
      </button>
      <span role="status" aria-live="polite">{notice}</span>
    </div>
  );
}

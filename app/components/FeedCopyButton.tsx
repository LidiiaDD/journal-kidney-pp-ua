"use client";

import { useState } from "react";

export default function FeedCopyButton({ url }: { url: string }) {
  const [notice, setNotice] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Посилання скопійовано.");
    } catch {
      setNotice("Не вдалося скопіювати. Відкрийте стрічку й скопіюйте адресу вручну.");
    }
  }

  return (
    <span className="jrs-feed-copy-wrap">
      <button type="button" onClick={() => void copy()} aria-label={`Копіювати адресу ${url}`}>
        Скопіювати RSS-адресу
      </button>
      <span role="status" aria-live="polite" className="jrs-feed-copy-notice">{notice}</span>
    </span>
  );
}

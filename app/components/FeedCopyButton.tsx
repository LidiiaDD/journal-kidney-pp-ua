"use client";

import { useState } from "react";
import { tryCopyFeedAddress } from "@/app/lib/jrs-feed-copy";

export default function FeedCopyButton({ url }: { url: string }) {
  const [notice, setNotice] = useState("");
  const [manualCopy, setManualCopy] = useState(false);

  async function copy() {
    const copied = await tryCopyFeedAddress(url, () => navigator.clipboard);
    setManualCopy(!copied);
    setNotice(copied
      ? "Посилання скопійовано."
      : "Автоматичне копіювання недоступне. Виділіть адресу нижче й скопіюйте вручну.");
  }

  return (
    <span className="jrs-feed-copy-wrap">
      <button type="button" onClick={() => void copy()} aria-label={`Копіювати адресу ${url}`}>
        Скопіювати RSS-адресу
      </button>
      <span role="status" aria-live="polite" className="jrs-feed-copy-notice">{notice}</span>
      {manualCopy && (
        <input
          type="text"
          readOnly
          value={url}
          aria-label="RSS-адреса для ручного копіювання"
          onFocus={event => event.currentTarget.select()}
          style={{ maxWidth: "100%", boxSizing: "border-box" }}
        />
      )}
    </span>
  );
}

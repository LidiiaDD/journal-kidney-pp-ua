"use client";

import { useState } from "react";
import { toggleReadingItem, useReadingList } from "@/app/lib/reading-list";

type Props = { slug: string; compact?: boolean; locale?: "uk" | "en" };

export default function BookmarkButton({ slug, compact = false, locale = "uk" }: Props) {
  const saved = useReadingList().includes(slug);
  const [notice, setNotice] = useState("");
  const label = locale === "en"
    ? saved ? "Remove from my reading list" : "Save to my reading list"
    : saved ? "Прибрати зі своєї бібліотеки" : "Зберегти до моєї бібліотеки";

  function toggle() {
    if (!toggleReadingItem(slug)) {
      setNotice(locale === "en" ? "Your browser could not save this bookmark." : "Браузер не дозволив зберегти закладку.");
      return;
    }
    setNotice("");
  }

  return (
    <span className={`jrs-bookmark-container${compact ? " is-compact" : ""}`}>
      <button
        className={`jrs-bookmark-button${saved ? " is-saved" : ""}`}
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={label}
        title={label}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.25 3.75h11.5v16.5L12 16.1l-5.75 4.15z" />
        </svg>
        <span>{locale === "en"
          ? compact ? (saved ? "Saved" : "Save") : (saved ? "Saved to my library" : "Save to library")
          : compact ? (saved ? "Збережено" : "Зберегти") : (saved ? "У моїй бібліотеці" : "Зберегти до бібліотеки")}</span>
      </button>
      {notice && <span className="jrs-bookmark-notice" role="status">{notice}</span>}
    </span>
  );
}

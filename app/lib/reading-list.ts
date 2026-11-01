"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved JRS article references live only in this browser profile.
 * No manuscript text, patient data, authentication tokens, or metadata are stored.
 */
const STORAGE_KEY = "jrs:reading-list:v1";
const UPDATE_EVENT = "jrs:reading-list:changed";
const MAX_ITEMS = 150;
const EMPTY: readonly string[] = Object.freeze([]);
const SLUG_PATTERN = /^[a-z0-9-]{3,100}$/;

let cachedRaw: string | null | undefined;
let cachedItems: readonly string[] = EMPTY;
let lastReadFailed = false;

function validSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(
    (item): item is string => typeof item === "string" && SLUG_PATTERN.test(item),
  ))].slice(0, MAX_ITEMS);
}

function read(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    lastReadFailed = true;
    // Preserve the last known bookmarks if storage becomes temporarily unreadable.
    // A failed read must not make an already-open library appear empty.
    return cachedItems;
  }
  lastReadFailed = false;
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    cachedItems = raw ? Object.freeze(validSlugs(JSON.parse(raw))) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function subscribe(notify: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATE_EVENT, notify);
  };
}

export function useReadingList(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Returns false if browser storage is blocked or unavailable. */
export function saveReadingList(items: readonly string[]): boolean {
  if (typeof window === "undefined") return false;
  const next = validSlugs(items);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = JSON.stringify(next);
    cachedItems = Object.freeze(next);
    window.dispatchEvent(new Event(UPDATE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/** Saves newest first. Returns false only when storage is unavailable. */
export function toggleReadingItem(slug: string): boolean {
  if (!SLUG_PATTERN.test(slug)) return false;
  const existing = read();
  // Never overwrite newer cross-tab bookmarks with a stale cached snapshot.
  if (lastReadFailed) return false;
  const next = existing.includes(slug)
    ? existing.filter(item => item !== slug)
    : [slug, ...existing];
  return saveReadingList(next);
}

/**
 * Remove only bookmarks whose articles are absent from the current public catalogue.
 * Read storage again at click time: a second tab may have added a bookmark since render.
 * A failed read must never overwrite the last known (possibly stale) selection.
 */
export function removeUnavailableReadingItems(allowedSlugs: readonly string[]): boolean {
  if (typeof window === "undefined") return false;
  const current = read();
  if (lastReadFailed) return false;
  const allowed = new Set(allowedSlugs);
  return saveReadingList(current.filter(slug => allowed.has(slug)));
}

/**
 * Clear only the selection the reader explicitly confirmed. A second tab
 * may have added a bookmark while the confirmation was open.
 * Browser storage is not transactional, so this guards sequential changes.
 */
export function clearReadingListIfUnchanged(expectedSlugs: readonly string[]): "cleared" | "changed" | "unavailable" {
  if (typeof window === "undefined") return "unavailable";
  const current = read();
  if (lastReadFailed) return "unavailable";
  if (current.length !== expectedSlugs.length ||
      current.some((slug, index) => slug !== expectedSlugs[index])) {
    return "changed";
  }
  return saveReadingList([]) ? "cleared" : "unavailable";
}

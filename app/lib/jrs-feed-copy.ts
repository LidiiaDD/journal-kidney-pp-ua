/** A missing or blocked Clipboard API must never hide the RSS address. */
export async function tryCopyFeedAddress(
  url: string,
  clipboard?: Pick<Clipboard, "writeText"> | (() => Pick<Clipboard, "writeText"> | undefined),
): Promise<boolean> {
  try {
    // Access to navigator.clipboard itself can throw in restricted browsers.
    const api = typeof clipboard === "function" ? clipboard() : clipboard;
    if (typeof api?.writeText !== "function") return false;
    await api.writeText(url);
    return true;
  } catch {
    return false;
  }
}

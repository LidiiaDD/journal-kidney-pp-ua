/** A missing or blocked Clipboard API must never hide the RSS address. */
export async function tryCopyFeedAddress(
  url: string,
  clipboard?: Pick<Clipboard, "writeText">,
): Promise<boolean> {
  if (!clipboard?.writeText) return false;
  try {
    await clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

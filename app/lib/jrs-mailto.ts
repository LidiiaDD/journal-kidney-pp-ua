/** Mail clients often reject long percent-encoded mailto URLs, especially Cyrillic text. */
const MAX_ENCODED_SUBJECT = 480;
const MAX_ENCODED_BODY = 1400;

function encodedPrefix(value: string, limit: number): string {
  let used = 0;
  let prefix = "";
  for (const character of value) {
    const size = encodeURIComponent(character).length;
    if (used + size > limit) break;
    used += size;
    prefix += character;
  }
  return prefix;
}

/** Preserve the full draft in the UI; shorten only the mailto payload when needed. */
export function prepareSubmissionMailto(subject: string, letter: string, fallback: string) {
  const mailSubject = encodedPrefix(subject, MAX_ENCODED_SUBJECT);
  const mailBody = encodeURIComponent(letter).length <= MAX_ENCODED_BODY
    ? letter : encodedPrefix(fallback, MAX_ENCODED_BODY);
  return {
    href: `mailto:editor@kidney.pp.ua?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`,
    shortened: mailSubject !== subject || mailBody !== letter,
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const citationTools = readFileSync(new URL("../app/components/CitationTools.tsx", import.meta.url), "utf8");

test("RIS and BibTeX exports keep their blob URL alive until downloads can begin", () => {
  assert.match(citationTools, /const url = URL\.createObjectURL\(blob\)/);
  assert.match(citationTools, /link\.download = `\$\{article\.slug\}\.\$\{extension\}`/);
  assert.match(citationTools, /link\.click\(\);\s*link\.remove\(\);\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 30_000\)/);
  assert.doesNotMatch(citationTools, /link\.click\(\);\s*link\.remove\(\);\s*URL\.revokeObjectURL\(url\)/);
});

const readingLibrary = readFileSync(new URL("../app/components/ReadingLibrary.tsx", import.meta.url), "utf8");

test("reading-library RIS/BibTeX exports defer blob URL cleanup", () => {
  assert.match(readingLibrary, /anchor\.click\(\);\s*anchor\.remove\(\);\s*\/\/[^\n]*\n\s*window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 30_000\)/);
  assert.doesNotMatch(readingLibrary, /anchor\.click\(\);\s*anchor\.remove\(\);\s*URL\.revokeObjectURL\(url\)/);
});

const englishCitationTools = readFileSync(new URL("../app/components/EnglishCitationTools.tsx", import.meta.url), "utf8");

test("English RIS/BibTeX downloads keep blob URLs alive for asynchronous mobile downloads", () => {
  assert.match(englishCitationTools, /element\.click\(\);\s*element\.remove\(\);[\s\S]*?window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 30_000\)/);
  assert.doesNotMatch(englishCitationTools, /element\.click\(\);\s*element\.remove\(\);\s*URL\.revokeObjectURL\(url\)/);
  assert.doesNotMatch(englishCitationTools, /URL\.revokeObjectURL\(url\), 800\)/);
});


import { runInNewContext } from "node:vm";

function citationCopyHarness(source, english = false, clipboard) {
  const handler = source.match(/  async function copy\(value: string, success: string\) \{([\s\S]*?)\n  \}\n\n  function (?:exportFile|download)/);
  assert.ok(handler, "actual citation copy handler remains available");
  const messages = [], manual = [];
  const context = {
    navigator: clipboard === null ? {} : { clipboard },
    setNotice: value => messages.push(value),
    setMessage: value => messages.push(value),
    setManualCopy: value => manual.push(value),
  };
  const copy = runInNewContext("(async function copy(value, success) {" + handler[1] + "\n})", context);
  return { copy, messages, manual };
}

for (const [label, source, success, manualLabel] of [
  ["Ukrainian", citationTools, "Цитування скопійовано.", "Текст для ручного копіювання"],
  ["English", englishCitationTools, "Citation copied.", "Text for manual copying"],
]) {
  test(label + " citation copy preserves exact link on clipboard denial and clears it on retry", async () => {
    let allowed = false, written = "";
    const api = { async writeText(value) {
      if (!allowed) throw new Error("NotAllowedError");
      written = value;
    } };
    const ui = citationCopyHarness(source, label === "English", api);
    await ui.copy("https://journal.kidney.pp.ua/publications/example", success);
    assert.equal(ui.manual.at(-1), "https://journal.kidney.pp.ua/publications/example");
    assert.match(ui.messages.at(-1), /вручну|manually/);
    allowed = true;
    await ui.copy("Citation example", success);
    assert.equal(written, "Citation example");
    assert.equal(ui.manual.at(-1), "");
    assert.equal(ui.messages.at(-1), success);
    const absent = citationCopyHarness(source, label === "English", null);
    await absent.copy("https://journal.kidney.pp.ua/publications/example", success);
    assert.equal(absent.manual.at(-1), "https://journal.kidney.pp.ua/publications/example");
    assert.ok(source.includes('aria-label="' + manualLabel + '"'));
    assert.match(source, /readOnly value=\{manualCopy\}/);
    assert.match(source, /onFocus=\{event => event\.currentTarget\.select\(\)\}/);
    assert.match(source, /setStyle\(event\.target\.value as CitationStyle\); setManualCopy\("?"\)/);
    assert.match(source, /setLanguage\(event\.target\.value as ArticleLanguage\); setManualCopy\("?"\)/);
  });
}

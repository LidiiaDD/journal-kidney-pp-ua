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

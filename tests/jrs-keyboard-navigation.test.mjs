import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/components/InternationalLayout.tsx", import.meta.url), "utf8");

test("English pages provide a keyboard-visible skip link to their main landmark", () => {
  assert.match(layout, /<a href="#top" className="sr-only focus:not-sr-only[^"]*focus:z-50[^"]*">\s*Skip to main content\s*<\/a>/);
  assert.match(layout, /<main id="top">/);
  assert.ok(layout.indexOf('href="#top"') < layout.indexOf('<header'), "skip link must precede navigation");
});

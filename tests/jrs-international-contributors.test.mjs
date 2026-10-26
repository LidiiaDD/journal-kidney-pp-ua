import test from "node:test";
import assert from "node:assert/strict";
import {
  authorEntries, authorHref, internationalAuthorHref,
  authorKey, findAuthorEntry, verifiedOrcidShape,
} from "../app/lib/jrs-contributors.ts";

function article(slug, authors, date="2026-10-26") {
  return {
    slug, title: "Study from a public research archive", authors, publishedAt: date,
    abstract: "Abstract", keywords: ["nephrology"], type: "original-research", language: "uk",
  };
}

test("both directories are empty without published-source articles", () => {
  assert.deepEqual(authorEntries([]), []);
  assert.equal(findAuthorEntry([], "0".repeat(24)), undefined);
});

test("Ukrainian and international directory links retain identical author identity", () => {
  const person = { name: "Олена Коваль", affiliation: "Medical School" };
  const key = authorKey(person);
  assert.match(key, /^[a-f0-9]{24}$/);
  assert.equal(authorHref(person), `/contributors/${key}`);
  assert.equal(internationalAuthorHref(person), `/en/contributors/${key}`);
  assert.equal(findAuthorEntry([article("real-1",[person])], key)?.articles.length, 1);
});

test("homonymous names with different institutions remain separate across languages", () => {
  const a = {name:"Anna Kovalenko", affiliation:"Institute A"};
  const b = {name:"Anna Kovalenko", affiliation:"Institute B"};
  const rows = authorEntries([article("paper-a",[a]),article("paper-b",[b])]);
  assert.equal(rows.length, 2);
  assert.notEqual(internationalAuthorHref(a), internationalAuthorHref(b));
});

test("valid checksum ORCID groups contributor records without inventing a translated name", () => {
  const orcid="0000-0002-1825-0097";
  const a={name:"Олена Коваль", affiliation:"Clinic A", orcid};
  const b={name:"Olena Koval", affiliation:"Clinic B", orcid:`https://orcid.org/${orcid}`};
  const rows=authorEntries([article("paper-1",[a]),article("paper-2",[b])]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].name,"Олена Коваль");
  assert.equal(rows[0].articles.length,2);
  assert.equal(rows[0].orcid,orcid);
  assert.equal(internationalAuthorHref(a),internationalAuthorHref(b));
});

test("an invalid or missing ORCID cannot become an apparently verified identifier", () => {
  assert.equal(verifiedOrcidShape("0000-0002-1825-0098"),undefined);
  assert.equal(verifiedOrcidShape("https://orcid.org/0000-0002-1825-0097"),"0000-0002-1825-0097");
  assert.equal(verifiedOrcidShape(undefined),undefined);
  const rows=authorEntries([article("invalid",[{
    name:"Olena", affiliation:"Lab", orcid:"0000-0002-1825-0098"
  }])]);
  assert.equal(rows[0].orcid,undefined);
});

test("identical records within a single article do not inflate publication counts", () => {
  const person={name:"Nadia Koval", affiliation:"Institute"};
  const rows=authorEntries([article("paper-1",[person,person])]);
  assert.equal(rows.length,1);
  assert.equal(rows[0].articles.length,1);
});

test("invalid profile keys do not resolve arbitrary records", () => {
  const records=[article("paper-1",[{name:"Nadia Koval"}])];
  assert.equal(findAuthorEntry(records,"../../private"),undefined);
  assert.equal(findAuthorEntry(records,"1234"),undefined);
});

import test from "node:test";
import assert from "node:assert/strict";
import { authorEntries, authorKey, authorHref, findAuthorEntry } from "../app/lib/jrs-contributors.ts";

function article(slug, authors, date="2026-10-20") {
  return {
    slug, authors, publishedAt:date, title:"Example study", abstract:"Abstract",
    type:"original-research", language:"uk", keywords:["Kidney"],
  };
}

test("directory is empty without published source publications", () => {
  assert.deepEqual(authorEntries([]), []);
});

test("same name with different institutions is not silently merged", () => {
  const list=authorEntries([
    article("test-a",[{name:"Ірина Коваль",affiliation:"Університет А"}]),
    article("test-b",[{name:"Ірина Коваль",affiliation:"Університет Б"}])
  ]);
  assert.equal(list.length,2);
  assert.equal(list[0].articles.length,1);
  assert.notEqual(list[0].key,list[1].key);
});

test("identical normalized name and affiliation collapse; repeated author entries do not double count", () => {
  const person={name:"  Олена   Мельник  ",affiliation:"  Медичний  університет "};
  const list=authorEntries([
    article("one",[person,person]),
    article("two",[{name:"олена мельник",affiliation:"медичний університет"}])
  ]);
  assert.equal(list.length,1);
  assert.equal(list[0].articles.length,2);
});

test("valid matching ORCID groups name or affiliation variants", () => {
  const a={name:"Olena Smith",orcid:"0000-0002-1825-0097"};
  const b={name:"Олена Сміт",affiliation:"Інший інститут",orcid:"https://orcid.org/0000-0002-1825-0097"};
  const list=authorEntries([article("paper-1",[a]),article("paper-2",[b])]);
  assert.equal(list.length,1);
  assert.equal(list[0].articles.length,2);
  assert.equal(list[0].orcid,"0000-0002-1825-0097");
  assert.equal(authorHref(a),`/contributors/${authorKey(b)}`);
  assert.equal(findAuthorEntry([article("paper-1",[a])],authorKey(a))?.articles.length,1);
});

test("invalid ORCID check digit cannot merge distinct author records", () => {
  const list=authorEntries([
    article("example-a",[{name:"Андрій Тест",orcid:"0000-0002-1825-0098",affiliation:"A"}]),
    article("example-b",[{name:"Андрій Тест",orcid:"0000-0002-1825-0098",affiliation:"B"}]),
  ]);
  assert.equal(list.length,2);
  assert.ok(list.every(x=>!x.orcid));
});

test("invalid contributor keys cannot resolve", () => {
  const records=[article("example-a",[{name:"Петро"}])];
  assert.equal(findAuthorEntry(records,"..%2fsecret"),undefined);
});

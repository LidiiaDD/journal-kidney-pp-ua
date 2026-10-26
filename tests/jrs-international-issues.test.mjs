import test from "node:test";
import assert from "node:assert/strict";
import {
  groupPublishedIssues, issueHref, makeIssueKey, parseIssueKey,
} from "../app/lib/jrs-issue-index.ts";
import { englishArticleView } from "../app/lib/jrs-english-article.ts";

const publicArticle = (slug, extra = {}) => ({
  slug,
  title: "Клінічне дослідження",
  abstract: "Опис дослідження",
  keywords: ["ХХН"],
  authors: [{ name: "Дослідниця А" }],
  language: "uk",
  type: "original-research",
  publishedAt: "2026-10-26",
  ...extra,
});

test("an empty published catalogue creates no announced issue", () => {
  assert.deepEqual(groupPublishedIssues([]), []);
});

test("articles without a complete volume AND issue cannot create collections", () => {
  const papers = [
    publicArticle("a"),
    publicArticle("b", { volume: "1" }),
    publicArticle("c", { issue: "2" }),
    publicArticle("d", { volume: "1", issue: " " }),
  ];
  assert.deepEqual(groupPublishedIssues(papers), []);
});

test("only complete published metadata groups into correct separate issues", () => {
  const papers = [
    publicArticle("one", { volume: " 1 ", issue: " 2 ", publishedAt: "2026-10-20" }),
    publicArticle("two", { volume: "1", issue: "2", publishedAt: "2026-10-26" }),
    publicArticle("three", { volume: "2", issue: "2", publishedAt: "2026-10-25" }),
  ];
  const issues = groupPublishedIssues(papers);
  assert.equal(issues.length, 2);
  assert.equal(issues[0].volume, "1");
  assert.equal(issues[0].number, "2");
  assert.equal(issues[0].articles.length, 2);
  assert.equal(issues[0].latestArticleDate, "2026-10-26");
  assert.deepEqual(issues[0].articles.map(p => p.slug), ["one", "two"]);
  assert.equal(issues[1].articles.length, 1);
});

test("issue key is canonical, roundtrips and yields identical Ukrainian/English routes", () => {
  const key = makeIssueKey("1", "2");
  assert.deepEqual(parseIssueKey(key), { volume: "1", number: "2" });
  assert.equal(issueHref(key), `/issues/${key}`);
  assert.equal(`/en${issueHref(key)}`, `/en/issues/${key}`);
});

test("untrusted or malformed keys are rejected", () => {
  for (const key of ["", "x", "../../admin", "!!!!", makeIssueKey("", "1"), makeIssueKey("1", " ".repeat(2))]) {
    assert.equal(parseIssueKey(key), null);
  }
});

test("volume and issue keys are independent even if their text contains punctuation", () => {
  const issues = groupPublishedIssues([
    publicArticle("a",{volume:"1,2",issue:"3"}),
    publicArticle("b",{volume:"1",issue:"2,3"}),
  ]);
  assert.equal(issues.length,2);
  assert.notEqual(issues[0].key,issues[1].key);
});

test("English table of contents never invents article metadata translations", () => {
  const article=publicArticle("paper-uk",{volume:"1",issue:"1"});
  const issue=groupPublishedIssues([article])[0];
  const view=englishArticleView(issue.articles[0]);
  assert.equal(view.metadata.title,article.title);
  assert.equal(view.language,"uk");
  assert.equal(view.englishAvailable,false);
});

test("complete editor-provided English metadata may be displayed in an issue listing", () => {
  const article=publicArticle("bilingual",{
    volume:"1",issue:"1",translations:{
      en:{title:"Chronic Kidney Disease Research",abstract:"Observations",keywords:["CKD"]}
    },
  });
  const result=englishArticleView(groupPublishedIssues([article])[0].articles[0]);
  assert.equal(result.englishAvailable,true);
  assert.equal(result.metadata.title,"Chronic Kidney Disease Research");
  assert.equal(result.language,"en");
});

test("a released article with no assigned issue remains outside issue counts", () => {
  const papers=[
    publicArticle("assigned",{volume:"1",issue:"1"}),
    publicArticle("unassigned"),
    publicArticle("partial",{volume:"1"}),
  ];
  const issues=groupPublishedIssues(papers);
  assert.equal(issues.length,1);
  const grouped=new Set(issues.flatMap(issue=>issue.articles.map(article=>article.slug)));
  assert.equal(papers.filter(article=>!grouped.has(article.slug)).length,2);
});

test("issue metadata longer than maximum allowable limit is never presented as an issue", () => {
  assert.deepEqual(groupPublishedIssues([
    publicArticle("oversized",{volume:"1",issue:"x".repeat(51)})
  ]),[]);
});

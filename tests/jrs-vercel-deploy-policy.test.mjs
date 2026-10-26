import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel config schema is declared correctly", () => {
  assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
  assert.deepEqual(Object.keys(config).sort(), ["$schema", "git"]);
});

test("automatic feature branch previews are disabled at source, not canceled during build", () => {
  assert.equal(config.git.deploymentEnabled["feature/**"], false);
  assert.equal(typeof config.git.deploymentEnabled, "object");
  assert.equal(config.git.deploymentEnabled !== false, true);
  assert.equal("ignoreCommand" in config, false);
  assert.equal("commandForIgnoringBuildStep" in config, false);
});

test("automatic production deployments from main stay explicitly enabled", () => {
  assert.equal(config.git.deploymentEnabled.main, true);
});

test("unrelated preview branches are not globally disabled", () => {
  assert.equal(config.git.deploymentEnabled["**"], undefined);
  assert.equal(config.git.deploymentEnabled["*"], undefined);
  assert.equal(config.git.deploymentEnabled["release/**"], undefined);
});

test("no rewrites, redirects or environment settings are changed", () => {
  assert.deepEqual(Object.keys(config.git), ["deploymentEnabled"]);
  assert.equal("env" in config, false);
  assert.equal("functions" in config, false);
  assert.equal("rewrites" in config, false);
  assert.equal("redirects" in config, false);
});

export type JrsReleaseInfo = {
  service: "journal-of-renal-science";
  environment: "production" | "preview" | "development" | "unknown";
  commit: string | null;
};

/** Public release metadata only: never serialize the environment map itself. */
export function jrsReleaseInfo(environment: Readonly<Record<string, string | undefined>>): JrsReleaseInfo {
  const rawEnvironment = environment.VERCEL_ENV;
  const deploymentEnvironment =
    rawEnvironment === "production" || rawEnvironment === "preview" || rawEnvironment === "development"
      ? rawEnvironment : "unknown";
  const rawCommit = environment.VERCEL_GIT_COMMIT_SHA || "";
  const commit = /^[a-f0-9]{40}$/.test(rawCommit) ? rawCommit : null;
  return {
    service: "journal-of-renal-science",
    environment: deploymentEnvironment,
    commit,
  };
}

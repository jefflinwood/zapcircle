// src/core/diffCollector.ts

import { execSync } from "child_process";
import { resolve } from "path";

export function getChangedFiles(baseBranch: string = "origin/main"): string[] {
  try {
    const repoRoot = execSync("git rev-parse --show-toplevel")
      .toString()
      .trim();

    const diffOutput = execSync(
      `git diff --name-status ${baseBranch}`,
    ).toString();
    const untrackedOutput = execSync(
      "git ls-files --others --exclude-standard",
    ).toString();

    const tracked = diffOutput
      .trim()
      .split("\n")
      .map((line) => {
        const [status, ...fileParts] = line.split(/\s+/);
        const filePath = fileParts.join(" ");
        return status === "M" || status === "A"
          ? resolve(repoRoot, filePath)
          : null;
      });

    const untracked = untrackedOutput
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((filePath) => resolve(repoRoot, filePath));

    return [...new Set([...tracked, ...untracked])].filter(
      (x): x is string => !!x,
    );
  } catch (error) {
    console.error("❌ Error fetching changed files:", error);
    return [];
  }
}

export function getDiffForFile(
  filePath: string,
  baseBranch: string = "origin/main",
): string {
  try {
    return execSync(`git diff ${baseBranch} -- ${filePath}`).toString();
  } catch (error) {
    console.error(`❌ Error fetching diff for ${filePath}:`, error);
    return "";
  }
}

export function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

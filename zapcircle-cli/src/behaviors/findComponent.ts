import path from "path";
import { globSync } from "glob";
import { AgentIssue } from "../issues/types";

function textMatches(text: string, name: string): boolean {
  return text.toLowerCase().includes(name.toLowerCase());
}

function scoreMatch(issue: AgentIssue, componentName: string): number {
  let score = 0;

  if (textMatches(issue.title, componentName)) score += 5;
  if (textMatches(issue.description, componentName)) score += 3;
  for (const comment of issue.comments || []) {
    if (typeof comment === "string" && textMatches(comment, componentName))
      score += 1;
    if (typeof comment === "object" && textMatches(comment.body, componentName))
      score += 1;
  }

  return score;
}

export function findLikelyComponentForIssue(
  issue: AgentIssue,
): string | undefined {
  const files = globSync("./**/*.{jsx,tsx}", { absolute: true });

  const candidates = files
    .map((file) => {
      const componentName = path.basename(file).replace(/\.(jsx|tsx)$/, "");
      const score = scoreMatch(issue, componentName);
      return { file, score };
    })
    .filter((candidate) => candidate.score > 0);

  if (candidates.length === 0) {
    return undefined;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].file;
}

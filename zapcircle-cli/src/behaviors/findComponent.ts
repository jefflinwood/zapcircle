import path from "path";
import glob from "glob";
import { AgentIssue } from "../issues/types";

function textMatches(text: string, name: string): boolean {
  return text.toLowerCase().includes(name.toLowerCase());
}

export function findLikelyComponentForIssue(issue: AgentIssue): string | undefined {
  const files = glob.sync("src/components/**/*.{jsx,tsx}", { absolute: true });

  for (const file of files) {
    const componentName = path.basename(file).replace(/\.(jsx|tsx)$/, "");

    const match =
      textMatches(issue.title, componentName) ||
      textMatches(issue.description, componentName) ||
      issue.comments.some((c) => textMatches(c.body, componentName));

    if (match) return file;
  }

  return undefined;
}
import fs from "fs";
import path from "path";
import { globSync } from "glob";

// Utility: Fuzzy match a component name against issue text
function textMatches(text: string, componentName: string): boolean {
  const normalized = text.toLowerCase();
  return normalized.includes(componentName.toLowerCase());
}

// Load all .zap.toml files from the project
function findAllBehaviorFiles(): string[] {
  return globSync("src/**/*.zap.toml", { absolute: true });
}

// Extract component name from file path (e.g., LoginForm.zap.toml → LoginForm)
function getComponentName(filePath: string): string {
  return path.basename(filePath).replace(".zap.toml", "");
}

// Main function
export function findBehaviorForIssue(issue: {
  title: string;
  description: string;
  comments: string[];
}): string | undefined {
  const behaviorFiles = findAllBehaviorFiles();

  for (const behaviorPath of behaviorFiles) {
    const componentName = getComponentName(behaviorPath);

    const match =
      textMatches(issue.title, componentName) ||
      textMatches(issue.description, componentName) ||
      issue.comments.some((c) => textMatches(c, componentName));

    if (match) return behaviorPath;
  }

  return undefined; // fallback: no match
}
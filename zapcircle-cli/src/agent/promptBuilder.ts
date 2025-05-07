import { ContextPackage } from "../context/types";

export function renderGenerationPrompt({
  issue,
  contextPackage,
}: {
  issue: { title: string; description: string; comments: string[] };
  contextPackage: ContextPackage;
}): string {
  const { behaviorFile, files, stateFiles } = contextPackage;

  return `
You are a behavior-driven assistant.

# Issue
Title: ${issue.title}
Description: ${issue.description}
Notes:
${issue.comments.map((c) => `- ${c}`).join("\n")}

# Behavior
${behaviorFile || "No behavior file provided."}

# Code
${Object.entries(files)
  .map(([path, content]) => `// ${path}\n${content}`)
  .join("\n\n")}

# Shared State
${stateFiles
  ? Object.entries(stateFiles)
      .map(([path, content]) => `// ${path}\n${content}`)
      .join("\n\n")
  : ""}

# Task
Modify the above component(s) to resolve the issue described. Do not add new dependencies.
Only change what is needed. Output only the full contents of the modified component.
`;
}
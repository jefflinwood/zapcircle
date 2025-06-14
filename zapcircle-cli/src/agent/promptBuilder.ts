import { ContextPackage } from "../context/types";
import { AgentIssue } from "../issues/types";

export function renderGenerationPrompt({
  issue,
  contextPackage,
  stylePreferences = {},
}: {
  issue: AgentIssue;
  contextPackage: ContextPackage;
  stylePreferences?: Record<string, string>;
}): string {
  const { behaviorFile, files, stateFiles } = contextPackage;

  const behaviorSection = behaviorFile
    ? `# Behavior\n${behaviorFile}`
    : `# Behavior\n⚠️ No behavior file was provided. Infer behavior based on the issue description and the provided component code. Be conservative with changes.`;

  const styleNotes = Object.keys(stylePreferences).length
    ? `# Style Preferences\n${Object.entries(stylePreferences)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")}`
    : "";

  return `
You are a behavior-driven assistant.

# Issue
Title: ${issue.title}
Description: ${issue.description}
Notes:
${issue.comments.map((c) => `- ${c}`).join("\n")}

${styleNotes}

# Behavior
${behaviorSection}

# Code
${Object.entries(files)
  .map(([path, content]) => `// ${path}\n${content}`)
  .join("\n\n")}

# Shared State
${
  stateFiles
    ? Object.entries(stateFiles)
        .map(([path, content]) => `// ${path}\n${content}`)
        .join("\n\n")
    : ""
}

# Task
Modify the above component(s) to resolve the issue described. Do not add new dependencies.
Only change what is needed. Output only the full contents of the modified component.
Do not include markdown. Only include the contents of the actual file.
`;
}

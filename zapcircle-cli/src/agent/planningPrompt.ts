// agent/planningPrompt.ts

import { ContextPackage } from "../context/types";
import { AgentIssue } from "../issues/types";

export function renderPlanningPrompt({
  issue,
  contextPackage,
}: {
  issue: AgentIssue;
  contextPackage: ContextPackage;
}): string {
  const { behaviorFile, files } = contextPackage;

  const behaviorSection = behaviorFile
    ? behaviorFile
    : "No behavior file available.";

  // Truncate source code for planning phase (we don't need all files)
  const limitedCode = Object.entries(files)
    .slice(0, 3)
    .map(([path, content]) => `// ${path}\n${content.slice(0, 500)}...`)
    .join("\n\n");

  return `
You are a senior software engineer preparing to implement a change request.

Here is the request from the user:
---
${issue.title}
${issue.description}
${issue.comments.map((c) => `- ${c}`).join("\n")}
---

Here is the existing behavior for the related component:
---
${behaviorSection}
---

Here is the relevant source code context (abbreviated):
---
${limitedCode}
---

Analyze the request deeply. Break it down into clear, high-level implementation steps that fully address the request, not just surface changes.

Consider:
- State updates
- API changes
- Persistent storage
- Security concerns
- Behavior file updates
- Testing impacts
- Multi-file changes if necessary

Output a JSON array of steps, where each step includes:
- description: what should be done
- relatedFiles: likely files involved

Example format:
[
  {"description": "Add checkbox", "relatedFiles": ["LoginForm.jsx"]},
  {"description": "Store JWT", "relatedFiles": ["authService.js"]}
]

Respond ONLY with valid JSON.
  `.trim();
}

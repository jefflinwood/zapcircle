// agent/proposeBehaviorUpdate.ts

import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";

export async function proposeBehaviorUpdate(
  existingBehavior: string,
  stepDescription: string,
): Promise<string> {
  const prompt = `
You are a behavior-driven development assistant.

You are helping update the behavior file for a component. The user has requested the following change:

---
${stepDescription}
---

Here is the existing behavior file:
---
${existingBehavior}
---

Update the behavior file to incorporate the requested change, while preserving all unrelated behavior that already exists.

Respond with ONLY the updated behavior file contents. Do not include markdown, comments, or explanations.
  `.trim();

  try {
    const response = await invokeLLMWithSpinner(prompt, true);
    return response;
  } catch (err) {
    console.error("❌ Failed to update behavior via LLM:", err);
    return existingBehavior;
  }
}

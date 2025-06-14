// agent/styleSuggester.ts

import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";

/**
 * Suggests coding style preferences by analyzing arbitrary code.
 * Uses an LLM to infer stylistic conventions, practices, or frameworks.
 * Future-proofed to support any language or paradigm.
 */

export async function suggestStylePreferences(
  code: string,
): Promise<Record<string, string>> {
  const prompt = `
You are an expert software development assistant. A developer has written the following code:

---
${code.slice(0, 3000)}
---

Analyze it and infer any stylistic preferences, conventions, tools, or frameworks the developer seems to favor.

Return your response as a flat JSON object, where each key is a style trait (e.g. "cssFramework", "language", "prefersFunctional", "testingFramework", etc.), and each value is your best guess.

Respond ONLY with JSON. No markdown, no explanation.
`.trim();

  try {
    const response = await invokeLLMWithSpinner(prompt, true);
    const json = JSON.parse(response);
    return json;
  } catch (err) {
    console.warn("⚠️ Could not infer style preferences:", err);
    return {};
  }
}

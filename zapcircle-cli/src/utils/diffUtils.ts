// zapcircle/utils/diffUtils.ts
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { safeParseJSON } from "./jsonUtils";

export interface SemanticDiffResult {
  score: number; // 0–5 scale
  satisfied: boolean;
  explanation: string;
}

export async function semanticDiffLLM(args: {
  issue: string;
  expected: string;
  generated: string;
  provider?: string;
  model?: string;
}): Promise<SemanticDiffResult> {
  const { issue, expected, generated, provider, model } = args;

  const prompt = `
You are evaluating a code generation task.

Task Description:
---
${issue}
---

Expected Code:
---
${expected}
---

Generated Code:
---
${generated}
---

Please answer the following questions:

1. Does the generated solution satisfy the task? Answer YES or NO.
2. Give a similarity score from 0 to 5, where 5 means "identical or functionally equivalent", and 0 means "completely misses the task".
3. Explain how well the generated code meets the task intent, or where it fails.

Respond in the following JSON format:
{
  "satisfied": true,
  "score": 4,
  "explanation": "The generated code correctly shows an error message for passwords shorter than 8 characters, but the error message is slightly different from the expected." 
}`;

  const raw = await invokeLLMWithSpinner(prompt, true);

  try {
    const parsed = safeParseJSON(raw);
    return {
      satisfied: Boolean(parsed.satisfied),
      score: Number(parsed.score),
      explanation: parsed.explanation || "No explanation returned",
    };
  } catch (err) {
    throw new Error(`❌ Failed to parse LLM output:\n${raw}`);
  }
}

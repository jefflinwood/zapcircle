// agent/planGenerator.ts

import { AgentIssue } from "../issues/types";
import { ContextPackage } from "../context/types";
import { renderPlanningPrompt } from "./planningPrompt";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { safeParseJSON } from "../utils/jsonUtils";

export type PlanStep = {
  description: string;
  relatedFiles: string[];
};

export async function generatePlanForIssue(
  issue: AgentIssue,
  contextPackage: ContextPackage,
): Promise<PlanStep[]> {
  const prompt = renderPlanningPrompt({ issue, contextPackage });
  const rawResponse = await invokeLLMWithSpinner(prompt, true);

  try {
    const parsed = safeParseJSON(rawResponse);
    return parsed;
  } catch (err) {
    console.warn("⚠️ Failed to parse plan from LLM:", err);
    return [];
  }
}

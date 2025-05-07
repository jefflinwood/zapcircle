import fs from "fs";
import path from "path";
import { buildContextForComponent } from "../context/index";
import { renderGenerationPrompt } from "./promptBuilder";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { findBehaviorForIssue } from "../behaviors/matcher";
import { findLikelyComponentForIssue } from "../behaviors/findComponent";

import { writeOutputFile } from "../utils/writeOutputFile";
import { resolveComponentFromBehavior } from "../behaviors/resolveComponentFromBehavior";

type Issue = {
  id: number;
  title: string;
  priority: string;
  description: string;
  comments: string[];
};

export async function runAgentOnIssue(issue: Issue) {
  console.log(`🧠 Running ZapCircle Agent on issue #${issue.id}...`);

  // Step 1: Try to find behavior
  let behaviorPath = findBehaviorForIssue(issue);
  let componentPath: string;

  if (behaviorPath) {
    const resolved = resolveComponentFromBehavior(behaviorPath);
    if (!resolved) {
      console.error("❌ Could not find matching component file for behavior.");
      return;
    }
    componentPath = resolved;
  } else {
    console.warn("⚠️ No behavior file matched. Searching for relevant component...");

    const guessedComponent = findLikelyComponentForIssue(issue);
    if (!guessedComponent) {
      console.error("❌ Could not infer a relevant component for this issue.");
      return;
    }

    componentPath = guessedComponent;
    console.warn(`⚠️ Proceeding with: ${componentPath}`);
  }

  // Step 2: Build context
  const context = await buildContextForComponent(componentPath, behaviorPath);

  // Step 3: Prompt construction
  const prompt = renderGenerationPrompt({
    issue,
    contextPackage: context,
  });

  // Step 4: Run generation
  const result = await invokeLLMWithSpinner(prompt, true);

  // Step 5: Write output
  const outputPath = path.resolve(componentPath); // Overwrites component for now
  await writeOutputFile(outputPath, result, true);

  console.log(`✅ Updated file written to: ${outputPath}`);
}
import fs from "fs";
import path from "path";
import { buildContextForComponent } from "../context/index";
import { renderGenerationPrompt } from "./promptBuilder";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { findBehaviorForIssue } from "../behaviors/matcher";
import { writeOutputFile } from "../utils/writeOutputFile";

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
  const behaviorPath = findBehaviorForIssue(issue);
  if (!behaviorPath) {
    console.warn("⚠️ No behavior file matched. Skipping.");
    return;
  }

  const componentPath = behaviorPath.replace(/\.zap\.toml$/, ".jsx");

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
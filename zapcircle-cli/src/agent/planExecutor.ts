// agent/planExecutor.ts

import fs from "fs";
import readline from "readline/promises";
import { PlanStep } from "./planGenerator";
import { proposeBehaviorUpdate } from "./proposeBehaviorUpdate";

export async function executePlanForIssue(plan: PlanStep[]): Promise<void> {
  for (const step of plan) {
    console.log(`\n🚧 Step: ${step.description}`);
    for (const file of step.relatedFiles) {
      if (file.endsWith(".zap.toml")) {
        await updateBehaviorFileInteractively(file, step.description);
      }
    }
  }
}

async function updateBehaviorFileInteractively(
  filePath: string,
  stepDescription: string,
) {
  let existing = "";
  try {
    existing = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.warn(`⚠️ Could not read behavior file: ${filePath}`);
    return;
  }

  console.log(`\n📄 Reviewing behavior file: ${filePath}`);
  console.log("--- Existing Behavior ---\n");
  console.log(existing);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(
    `\nUpdate behavior file for: "${stepDescription}"? [Y/n]: `,
  );
  rl.close();

  if (answer.toLowerCase().startsWith("n")) {
    console.log("❌ Skipping behavior update.");
    return;
  }

  const updatedBehavior = await proposeBehaviorUpdate(
    existing,
    stepDescription,
  );
  fs.writeFileSync(filePath, updatedBehavior, "utf-8");
  console.log("✅ Behavior file updated.");
}

// agent/pair.ts

import readline from "readline/promises";
import { runAgentOnIssue } from "./run";
import { AgentIssue } from "../issues/types";
import { undoLastChange } from "./undoManager";
import { readIssueLog } from "./writeIssueLog";
import { existsSync, readFileSync } from "fs";
import { diffLinesUnified } from "jest-diff";
import { updateSessionContext, getSessionContext } from "./sessionContext";
import { suggestStylePreferences } from "./styleSuggester";
import { generatePlanForIssue } from "./planGenerator";
import { executePlanForIssue } from "./planExecutor";
import { buildContextForComponent } from "../context/index";
import { findBehaviorForIssue } from "../behaviors/matcher";
import { resolveComponentFromBehavior } from "../behaviors/resolveComponentFromBehavior";
import { findLikelyComponentForIssue } from "../behaviors/findComponent";
import { ensureBehaviorForComponent } from "../behaviors/ensureBehaviorForComponent";

export async function runAgentPair(issue: AgentIssue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n🤝 Pairing mode: ZapCircle Agent");
  console.log(`Working on issue: ${issue.title}`);

  const session = getSessionContext();
  if (session.stylePreferences) {
    console.log("\n🎨 Style Preferences Loaded:");
    Object.entries(session.stylePreferences).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });
  }

  // Context building before planning
  let behaviorPath: string | undefined;
  let componentPath: string | undefined;

  behaviorPath = findBehaviorForIssue(issue);
  if (behaviorPath) {
    const resolved = resolveComponentFromBehavior(behaviorPath);
    if (!resolved) {
      console.log("❌ Could not resolve component path from behavior.");
      rl.close();
      return;
    }
    componentPath = resolved;
  } else {
    const guessed = findLikelyComponentForIssue(issue);
    if (!guessed) {
      console.log("❌ Could not locate related component.");
      rl.close();
      return;
    }
    componentPath = guessed;
  }

  behaviorPath = await ensureBehaviorForComponent(componentPath);
  const contextPackage = await buildContextForComponent(
    componentPath,
    behaviorPath,
  );

  // Generate planning proposal
  const plan = await generatePlanForIssue(issue, contextPackage);
  console.log("\n📝 Proposed Plan:");
  plan.forEach((step: any, idx: number) => {
    console.log(`${idx + 1}. ${step.description}`);
    if (step.relatedFiles?.length > 0) {
      console.log("   Files: " + step.relatedFiles.join(", "));
    }
  });

  const confirmPlan = await rl.question("\n✅ Approve this plan? [Y/n]: ");
  if (confirmPlan.toLowerCase().startsWith("n")) {
    console.log("❌ Plan rejected.");
    rl.close();
    return;
  }

  // Execute plan interactively (update behavior files)
  await executePlanForIssue(plan);

  // Read original file contents for diffing later
  let originalContents = "";
  let outputPath = "";
  const logBefore = readIssueLog(issue.id);
  if (logBefore?.outputPath && existsSync(logBefore.outputPath)) {
    originalContents = readFileSync(logBefore.outputPath, "utf-8");
    outputPath = logBefore.outputPath;
  }

  await runAgentOnIssue(issue, {
    interactive: true,
    stylePreferences: session.stylePreferences,
  });

  const logAfter = readIssueLog(issue.id);
  if (!logAfter?.outputPath || !existsSync(logAfter.outputPath)) {
    rl.close();
    return;
  }

  const updatedContents = readFileSync(logAfter.outputPath, "utf-8");
  const diff = diffLinesUnified(
    originalContents.split("\n"),
    updatedContents.split("\n"),
  );

  console.log("\n🧾 Code Diff Preview:\n");
  console.log(diff);

  const apply = await rl.question(
    "\n✅ Accept this change? [Y/n/u for undo]: ",
  );

  if (apply.toLowerCase().startsWith("n")) {
    console.log("❌ Rejected.");
  } else if (apply.toLowerCase().startsWith("u")) {
    await undoLastChange(issue.id);
  } else {
    console.log("✅ Change accepted.");

    const suggested = await suggestStylePreferences(updatedContents);
    if (suggested && Object.keys(suggested).length > 0) {
      console.log("\n✨ Suggested Style Preferences:");
      Object.entries(suggested).forEach(([key, val]) => {
        console.log(`- ${key}: ${val}`);
      });
      const confirmUpdate = await rl.question(
        "\n💾 Add these to your session? [Y/n]: ",
      );
      if (!confirmUpdate.toLowerCase().startsWith("n")) {
        updateSessionContext({
          lastEditedComponent: logAfter.componentPath,
          lastIssueId: issue.id,
          lastAcceptedPlanAt: new Date().toISOString(),
          stylePreferences: {
            ...session.stylePreferences,
            ...suggested,
          },
        });
      }
    } else {
      updateSessionContext({
        lastEditedComponent: logAfter.componentPath,
        lastIssueId: issue.id,
        lastAcceptedPlanAt: new Date().toISOString(),
      });
    }
  }

  rl.close();
}

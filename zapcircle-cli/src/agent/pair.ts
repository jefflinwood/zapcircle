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

  const continueRun = await rl.question(
    "\n📋 Proceed with agent plan? [Y/n]: ",
  );
  if (continueRun.toLowerCase().startsWith("n")) {
    console.log("❌ Canceled.");
    rl.close();
    return;
  }

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

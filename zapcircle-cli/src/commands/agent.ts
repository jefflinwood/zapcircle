import { listIssues, readIssueSync } from "../issues";
import { runAgentOnIssue } from "../agent/run";
import readline from "readline/promises";
import { createReadlineInterface } from "../utils/platformUtils";

export const agentRunCommand = async () => {
  const issues = listIssues();

  if (issues.length === 0) {
    console.log("🚫 No issues found in .zapcircle/agent/issues/");
    return;
  }

  console.log("📋 Available Issues:\n");

  issues.forEach((issue, index) => {
    const statusLabel = issue.status === "completed" ? "✅ done" :
                        issue.status === "failed" ? "❌ failed" :
                        "🆕 new";
    console.log(`${index + 1}) ${issue.title} (${issue.priority.toLowerCase()}) [${statusLabel}]`);
  });

  const rl = createReadlineInterface();

  const askQuestion = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const input = await askQuestion("\nSelect an issue to run (number): ");
  rl.close();

  const index = parseInt(input, 10) - 1;
  if (isNaN(index) || index < 0 || index >= issues.length) {
    console.error("❌ Invalid selection.");
    return;
  }

  const selectedIssue = issues[index];
  console.log(`\n🧠 Running ZapCircle Agent on: ${selectedIssue.title}\n`);
  await runAgentOnIssue(selectedIssue);
};
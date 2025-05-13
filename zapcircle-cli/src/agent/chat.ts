import readline from "readline/promises";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { runAgentOnIssue } from "./run";
import { writeIssueLog } from "./writeIssueLog";

type StructuredIssue = {
  title: string;
  description: string;
  acceptanceCriteria: string[];
};

export async function runAgentChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Welcome to ZapCircle Agent Chat!");
  const rawInput = await rl.question("\nWhat's the problem you'd like help with?\n> ");

  const structuringPrompt = `
You are a software assistant. A user has described a problem below.

Convert it into a structured issue with the following fields:
- title (short summary)
- description (2–3 sentence explanation)
- acceptanceCriteria (bulleted list of what should be true when this is fixed)

User input:
"${rawInput}"

Respond in JSON like:
{
  "title": "...",
  "description": "...",
  "acceptanceCriteria": ["...", "..."]
}

Do not include any markdown or comments, just JSON suitable for ingestion in another application.
`.trim();

  const structuredRaw = await invokeLLMWithSpinner(structuringPrompt, true);
  let structured: StructuredIssue;

  try {
    structured = JSON.parse(structuredRaw);
  } catch (err) {
    console.error("❌ Failed to parse structured issue from LLM response.");
    console.error(structuredRaw);
    rl.close();
    return;
  }

  console.log("\n📝 Here's what I understood:");
  console.log(`\nTitle: ${structured.title}`);
  console.log(`Description: ${structured.description}`);
  console.log(`Acceptance Criteria:\n${structured.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`);

  const confirmation = await rl.question("\n✅ Use this plan? [Y/n]: ");
  rl.close();

  if (confirmation.toLowerCase().startsWith("n")) {
    console.log("❌ Canceled.");
    return;
  }

  const issueId = Date.now(); // simple temporary ID
  const issue = {
    id: issueId,
    title: structured.title,
    description: structured.description,
    comments: [],
    priority: "Normal"
  };

  // Save to issue log as pending
  writeIssueLog(issue.id, {
    ...issue,
    status: "pending",
    source: "chat",
    createdAt: new Date().toISOString()
  });

  await runAgentOnIssue(issue);
}
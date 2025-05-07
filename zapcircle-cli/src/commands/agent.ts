import { runAgentOnIssue } from "../agent/run";
import fs from "fs";
import path from "path";

export const agentRunCommand = async () => {
  const raw = fs.readFileSync(path.resolve("src/agent/example-issue.json"), "utf-8");
  const issue = JSON.parse(raw);
  await runAgentOnIssue(issue);
};
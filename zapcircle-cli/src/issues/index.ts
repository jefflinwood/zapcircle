import path from "path";
import toml from "@iarna/toml";
import { AgentIssue, SyncLogEntry } from "./types";
import {
  pathExists,
  readFile,
  writeFile,
  getCurrentDir,
  createDirectory,
  readDirSync,
} from "../utils/platformUtils";

const issuesDir = path.join(getCurrentDir(), ".zapcircle/agent/issues");
const syncLogPath = path.join(issuesDir, "sync.log.jsonl");

// Ensure the directory exists
if (!pathExists(issuesDir)) {
  createDirectory(issuesDir);
}

export function listIssues(filter?: {
  status?: string;
  source?: string;
}): AgentIssue[] {
  const allFiles = readDirSync(issuesDir).filter((f) => f.endsWith(".toml"));
  return allFiles
    .map((file) => path.join(issuesDir, file))
    .map(readIssueSync)
    .filter((issue) => {
      if (filter?.status && issue.status !== filter.status) return false;
      if (filter?.source && issue.source !== filter.source) return false;
      return true;
    });
}

export function readIssueSync(filePathOrId: string | number): AgentIssue {
  const filePath =
    typeof filePathOrId === "number"
      ? path.join(issuesDir, `${filePathOrId}.toml`)
      : filePathOrId;

  if (!pathExists(filePath))
    throw new Error(`Issue file not found: ${filePath}`);

  const contents = readFile(filePath);
  const issue = toml.parse(contents) as AgentIssue;

  logIssueSyncEvent({
    timestamp: new Date().toISOString(),
    issueId: issue.id,
    action: "read",
    source: "local",
  });

  return issue;
}

export function writeIssue(issue: AgentIssue): void {
  const filePath = path.join(issuesDir, `${issue.id}.toml`);
  const tomlText = toml.stringify(issue);
  writeFile(filePath, tomlText);

  logIssueSyncEvent({
    timestamp: new Date().toISOString(),
    issueId: issue.id,
    action: "write",
    source: "local",
  });
}

export function logIssueSyncEvent(event: SyncLogEntry): void {
  const line = JSON.stringify(event);
  const existing = pathExists(syncLogPath) ? readFile(syncLogPath) : "";
  writeFile(syncLogPath, existing + line + "\n");
}

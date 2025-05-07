import fs from "fs";
import path from "path";
import { Table } from "console-table-printer";

type IssueLog = {
  id: number;
  status: string;
  title: string;
  generatedAt?: string;
  failedAt?: string;
  componentPath?: string;
  behaviorPath?: string;
  failureReason?: string;
};

export function showAgentStatus() {
  const issuesDir = path.resolve(".zapcircle/agent/issues");
  if (!fs.existsSync(issuesDir)) {
    console.error("No issues found. Try running `zapcircle agent run` first.");
    return;
  }

  const files = fs.readdirSync(issuesDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("📭 No issue logs found in `.zapcircle/agent/issues/`.");
    return;
  }

  const rows: IssueLog[] = files.map(file => {
    const content = fs.readFileSync(path.join(issuesDir, file), "utf-8");
    return JSON.parse(content);
  });

  const table = new Table({
    title: "ZapCircle Agent Issue Status",
    columns: [
      { name: "id", alignment: "right" },
      { name: "status", alignment: "left", maxLen: 15 },
      { name: "title", alignment: "left", maxLen: 30 },
      { name: "component", alignment: "left", maxLen: 30 },
      { name: "timestamp", alignment: "left", maxLen: 20 },
    ]
  });

  for (const issue of rows) {
    table.addRow({
      id: issue.id,
      status: formatStatus(issue.status),
      title: issue.title,
      component: issue.componentPath ? shortPath(issue.componentPath) : "-",
      timestamp: issue.generatedAt || issue.failedAt || "-"
    });
  }

  table.printTable();
}

function shortPath(fullPath: string): string {
  return fullPath.replace(process.cwd() + "/", "");
}

function formatStatus(status: string): string {
  switch (status) {
    case "completed": return "✅ completed";
    case "failed": return "❌ failed";
    case "pending": return "⏳ pending";
    default: return status;
  }
}
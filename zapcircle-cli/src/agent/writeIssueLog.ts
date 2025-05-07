import fs from "fs";
import path from "path";

export function writeIssueLog(issueId: number, data: Record<string, any>) {
  const dir = path.resolve(".zapcircle/agent/issues");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${issueId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
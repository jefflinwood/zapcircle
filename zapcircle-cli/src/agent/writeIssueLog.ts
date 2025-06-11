import fs from "fs";
import path from "path";

export function writeIssueLog(issueId: number, data: Record<string, any>) {
  const dir = path.resolve(".zapcircle/agent/issues");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${issueId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readIssueLog(issueId: number): Record<string, any> | null {
  const filePath = path.resolve(".zapcircle/agent/issues", `${issueId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("⚠️ Failed to read issue log:", err);
    return null;
  }
}

// agent/undoManager.ts

import fs from "fs";
import path from "path";
import { readIssueLog, writeIssueLog } from "./writeIssueLog";

/**
 * Supports undoing changes for an issue by restoring file backups.
 */

export async function undoLastChange(issueId: number) {
  const issueLog = readIssueLog(issueId);
  if (!issueLog?.outputPath) {
    console.warn("⚠️ No output file path found for this issue.");
    return;
  }

  const backupPath = getBackupPath(issueLog.outputPath);

  if (!fs.existsSync(backupPath)) {
    console.warn("⚠️ No backup file found for undo.");
    return;
  }

  try {
    fs.copyFileSync(backupPath, issueLog.outputPath);
    console.log("⏪ Undo successful: original file restored.");

    writeIssueLog(issueId, {
      ...issueLog,
      status: "undone",
      undoneAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Failed to undo change:", err);
  }
}

export function createBackup(outputPath: string, contents: string) {
  try {
    const backupPath = getBackupPath(outputPath);
    fs.writeFileSync(backupPath, contents, "utf-8");
  } catch (err) {
    console.warn("⚠️ Could not create backup:", err);
  }
}

function getBackupPath(filePath: string): string {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  return path.join(dir, ".zapcircle-backup-" + base);
}

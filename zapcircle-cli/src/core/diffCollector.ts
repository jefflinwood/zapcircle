// src/core/diffCollector.ts

import { execSync } from "child_process";
import { resolve } from "path";
import fs from "fs";
import path from "path";
import { relative } from "path";

export function getSmartChunksForReview(
  filePath: string,
  baseBranch: string = "origin/main",
): string {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileLines = fs.readFileSync(filePath, "utf8").split("\n");

    // Step 1: Get changed lines from diff
    const diff = execSync(
      `git diff --unified=0 ${baseBranch} -- "${filePath}"`,
    ).toString();
    const changedLines = new Set<number>();

    const hunkRegex = /^@@ \-(\d+)(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;
    const diffLines = diff.split("\n");

    let currentNewLine = 0;
    for (const line of diffLines) {
      const hunk = hunkRegex.exec(line);
      if (hunk) {
        currentNewLine = parseInt(hunk[2], 10);
        continue;
      }

      if (line.startsWith("+") && !line.startsWith("+++")) {
        changedLines.add(currentNewLine);
        currentNewLine++;
      } else if (!line.startsWith("-") && !line.startsWith("---")) {
        currentNewLine++;
      }
    }

    // Step 2: Create ranges around changed lines (5 lines before and after)
    const expandedLines = new Set<number>();
    for (const line of changedLines) {
      for (let i = line - 5; i <= line + 5; i++) {
        if (i > 0 && i <= fileLines.length) {
          expandedLines.add(i);
        }
      }
    }

    // Step 3: Group into continuous blocks
    const sorted = Array.from(expandedLines).sort((a, b) => a - b);
    const chunks: number[][] = [];
    let currentChunk: number[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || sorted[i] === sorted[i - 1] + 1) {
        currentChunk.push(sorted[i]);
      } else {
        chunks.push(currentChunk);
        currentChunk = [sorted[i]];
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    // Step 4: Render annotated blocks
    const rendered = chunks
      .map((chunk) => {
        return chunk
          .map((lineNum) => {
            const lineno = lineNum.toString().padStart(4, " ");
            const marker = changedLines.has(lineNum) ? "👉 " : "   ";
            return `${lineno} | ${marker}${fileLines[lineNum - 1]}`;
          })
          .join("\n");
      })
      .join("\n\n...snip...\n\n");

    return `// === File: ${relativePath} ===\n${rendered}`;
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err);
    return "";
  }
}

export function getChangedFiles(baseBranch: string = "origin/main"): string[] {
  try {
    const repoRoot = execSync("git rev-parse --show-toplevel")
      .toString()
      .trim();

    const diffOutput = execSync(
      `git diff --name-status ${baseBranch}`,
    ).toString();
    const untrackedOutput = execSync(
      "git ls-files --others --exclude-standard",
    ).toString();

    const tracked = diffOutput
      .trim()
      .split("\n")
      .map((line) => {
        const [status, ...fileParts] = line.split(/\s+/);
        const filePath = fileParts.join(" ");
        return status === "M" || status === "A"
          ? resolve(repoRoot, filePath)
          : null;
      });

    const untracked = untrackedOutput
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((filePath) => resolve(repoRoot, filePath));

    return [...new Set([...tracked, ...untracked])].filter(
      (x): x is string => !!x,
    );
  } catch (error) {
    console.error("❌ Error fetching changed files:", error);
    return [];
  }
}

export function getDiffForFile(
  filePath: string,
  baseBranch: string = "origin/main",
): string {
  try {
    return execSync(`git diff ${baseBranch} -- ${filePath}`).toString();
  } catch (error) {
    console.error(`❌ Error fetching diff for ${filePath}:`, error);
    return "";
  }
}

export function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getModifiedFileWithLineNumbers(filePath: string): string {
  try {
    const lines = fs.readFileSync(filePath, "utf8").split("\n");
    return lines
      .map((line, index) => {
        const lineno = (index + 1).toString().padStart(4, " ");
        return `${lineno} | ${line}`;
      })
      .join("\n");
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return "";
  }
}

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import path, { resolve } from "path";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { encode } from "gpt-tokenizer"; // Assuming OpenAI's tokenizer is used

const DEFAULT_CONTEXT_LIMIT = 128000; // Default token limit

export async function review(options: {
  provider?: string; 
  model?: string;
  verbose?: boolean;
  github?: boolean;
  contextLimit?: number;
}) {
  try {
    const isVerbose = options.verbose || false;
    const isGitHubEnabled = options.github || false;
    const contextLimit = options.contextLimit || DEFAULT_CONTEXT_LIMIT;

    console.log("🔍 Fetching changed files...");
    const changedFiles = getChangedFiles();

    if (changedFiles.length === 0) {
      console.log("✅ No files changed. Skipping review.");
      return;
    }

    console.log(`🧐 Analyzing ${changedFiles.length} modified files...`);

    let reviewResults: any[] = [];
    let codeToReview: any[] = [];
    let totalTokensUsed = 0;

    for (const filePath of changedFiles) {
      console.log(`🔎 Reviewing ${filePath}...`);
      const absolutePath = path.resolve(filePath);
      if (!existsSync(absolutePath)) {
        console.warn(`Skipping ${filePath} (file does not exist)...`);
        continue;
      }

      const behaviorFilePath = `${absolutePath}.zap.toml`;
      let behaviorFileContents = "";
      if (existsSync(behaviorFilePath)) {
        behaviorFileContents = readFileSync(behaviorFilePath, "utf-8");
        totalTokensUsed += estimateTokenCount(behaviorFileContents);
        codeToReview.push({
          fileName: behaviorFilePath,
          fileContents: behaviorFileContents,
        });
      }

      const fileDiff = getDiffForFile(absolutePath);
      totalTokensUsed += estimateTokenCount(fileDiff);

      if (totalTokensUsed > contextLimit) {
        console.warn(`Skipping ${filePath} diff to stay within token limit.`);
        continue;
      }
      codeToReview.push({ fileName: filePath, fileDiff: fileDiff });

      const reviewVariables = {
        name: path.basename(filePath),
        diff: fileDiff,
        behavior: behaviorFileContents,
      };

      const prompt = await loadPrompt("code", "review", reviewVariables);
      const rawResult = await invokeLLMWithSpinner(
        prompt,
        isVerbose,
        false,
        !isGitHubEnabled,
        options.provider,
        options.model
      );

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawResult);
      } catch (error) {
        console.error(
          `⚠️ Failed to parse LLM response for ${filePath}. Raw result:`,
          rawResult,
        );
        continue;
      }

      if (parsedResult.length > 0) {
        reviewResults.push({
          file: filePath,
          issues: parsedResult.map((issue: any) => ({
            line: issue.line ?? "Unknown",
            message: issue.message ?? "No description provided.",
          })),
        });
      } else {
        console.log(`✅ No issues found in ${filePath}. Skipping from report.`);
      }
    }

    if (codeToReview.length > 0) {
      console.log("📢 Generating summary...");
      const summary = await generateSummary(
        codeToReview,
        isVerbose,
        isGitHubEnabled,
      );
      console.log("📢 Posting PR review...");

      if (isGitHubEnabled) {
        await postGitHubComment(summary, formatPRComment(reviewResults));
      } else {
        console.log(summary + "\n" + formatPRComment(reviewResults));
      }
    }

    console.log("🚀 Review process completed!");
  } catch (error) {
    console.error("❌ Error reviewing PR:", error);
  }
}

function estimateTokenCount(text: string): number {
  return encode(text).length;
}

/**
 * Generates a high-level summary of the code changes using LLM.
 */
export async function generateSummary(
  codeToReview: any[],
  verbose: boolean,
  isGitHubEnabled: boolean,
): Promise<string> {
  const reviewData = {
    reviewData: JSON.stringify(codeToReview),
  };
  const summaryPrompt = await loadPrompt("pullrequest", "review", reviewData);
  return await invokeLLMWithSpinner(
    summaryPrompt,
    verbose,
    false,
    !isGitHubEnabled,
  );
}
/**
 * Fetches the list of files changed in the current PR and resolves them relative to the Git repository root.
 * @param baseBranch - The base branch to compare against (default: origin/main).
 */
export function getChangedFiles(baseBranch: string = "origin/main"): string[] {
  try {
    // Get the absolute path to the root of the Git repository
    const repoRoot = execSync(`git rev-parse --show-toplevel`)
      .toString()
      .trim();

    // Run the diff command to get changed files
    const diffOutput = execSync(
      `git diff --name-status ${baseBranch}`,
    ).toString();

    return diffOutput
      .trim()
      .split("\n")
      .map((line) => {
        const [status, ...fileParts] = line.split(/\s+/);
        const filePath = fileParts.join(" "); // Handle file paths with spaces
        return status === "M" || status === "A"
          ? resolve(repoRoot, filePath)
          : null;
      })
      .filter((filePath): filePath is string => filePath !== null); // Remove null values
  } catch (error) {
    console.error("❌ Error fetching changed files:", error);
    return [];
  }
}

/**
 * Fetches the diff for a given file.
 */
export function getDiffForFile(filePath: string): string {
  try {
    return execSync(`git diff origin/main -- ${filePath}`).toString();
  } catch (error) {
    console.error(`❌ Error fetching diff for ${filePath}:`, error);
    return "";
  }
}

/**
 * Formats the LLM review results into a structured GitHub PR comment.
 */
export function formatPRComment(reviewData: any[]): string {
  let comment = "";

  const iconMap: Record<string, string> = {
    low: "🟡",
    medium: "🟠",
    high: "🔴",
  };

  reviewData.forEach((file) => {
    comment += `### **${file.file}**\n`;
    file.issues.forEach((issue: any) => {
      const icon = iconMap[issue.severity] || "🟡";
      comment += `- ${icon} **Line ${issue.line}**: ${issue.message} \n`;
    });
    comment += `\n`;
  });

  if (reviewData.length > 0) {
    comment +=
      "**ZapCircle CI is non-blocking, but these improvements are recommended.**\n";
  }
  return comment;
}

/**
 * Posts (or updates) the review summary and issues as a GitHub PR comment.
 */
export async function postGitHubComment(
  summary: string,
  reviewComment: string,
) {
  const prNumber = process.env.GITHUB_REF?.match(/\d+/)?.[0];
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!prNumber || !repo || !token) {
    console.error(
      "❌ GitHub PR review posting failed: Missing environment variables. Required - GITHUB_REF, GITHUB_REPOSITORY, GITHUB_TOKEN",
    );
    return;
  }

  const apiUrl = `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`;

  try {
    // Check if an existing ZapCircle comment exists
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error when fetching comments: ${response.status} ${response.statusText}`,
      );
    }

    const comments = await response.json();
    const existingComment = comments.find((comment: any) =>
      comment.body.includes("🚀 **ZapCircle PR Review**"),
    );

    const newCommentBody = `🚀 **ZapCircle PR Review**\n\n${summary}\n\n${reviewComment}`;

    if (existingComment) {
      // Update existing comment
      const updateUrl = `https://api.github.com/repos/${repo}/issues/comments/${existingComment.id}`;
      await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newCommentBody }),
      });
      console.log("✅ Updated PR review comment.");
    } else {
      // Post a new comment
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newCommentBody }),
      });
      console.log("✅ Posted new PR review comment.");
    }
  } catch (error) {
    console.error("❌ Error posting PR comment:", error);
  }
}

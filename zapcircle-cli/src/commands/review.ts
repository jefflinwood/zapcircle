import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { invokeLLM } from "../core/llmService";

const DEFAULT_CONTEXT_LIMIT = 128000; // Default token limit

export async function review(options: { verbose?: boolean; github?: boolean; contextLimit?: number }) {
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
      const absolutePath = path.resolve(removeFirstDirectory(filePath));
      if (!existsSync(absolutePath)) {
        console.warn(`Skipping ${filePath} (file does not exist)...`);
        continue;
      }

      const fileContents = readFileSync(absolutePath, "utf-8");
      const estimatedTokens = estimateTokenCount(fileContents);
      
      if (totalTokensUsed + estimatedTokens > contextLimit) {
        console.warn(`Skipping ${filePath} to stay within token limit.`);
        continue;
      }
      totalTokensUsed += estimatedTokens;
      
      codeToReview.push({ fileName: filePath, fileContents: fileContents });

      const behaviorFilePath = `${absolutePath}.zap.toml`;
      let behaviorFileContents = "";
      if (existsSync(behaviorFilePath)) {
        behaviorFileContents = readFileSync(behaviorFilePath, "utf-8");
        totalTokensUsed += estimateTokenCount(behaviorFileContents);
        codeToReview.push({ fileName: behaviorFilePath, fileContents: behaviorFileContents });
      }

      const fileDiff = getDiffForFile(absolutePath);
      totalTokensUsed += estimateTokenCount(fileDiff);

      if (totalTokensUsed > contextLimit) {
        console.warn(`Skipping ${filePath} diff to stay within token limit.`);
        continue;
      }

      const reviewVariables = {
        name: path.basename(filePath),
        diff: fileDiff,
        behavior: behaviorFileContents,
      };

      const prompt = await loadPrompt("code", "review", reviewVariables);
      const rawResult = await invokeLLMWithSpinner(prompt, isVerbose, false, !isGitHubEnabled);

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawResult);
      } catch (error) {
        console.error(`⚠️ Failed to parse LLM response for ${filePath}. Raw result:`, rawResult);
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
      const summary = await generateSummary(codeToReview, isVerbose, isGitHubEnabled);
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
  return Math.ceil(text.length / 4); // Rough estimate (4 chars per token)
}


/**
 * Generates a high-level summary of the code changes using LLM.
 */
export async function generateSummary(
  codeToReview: any[],
  verbose: boolean,
  isGitHubEnabled: boolean
): Promise<string> {
  const reviewData = {
    reviewData: JSON.stringify(codeToReview),
  };
  const summaryPrompt = await loadPrompt("pullrequest", "review", reviewData);
  return await invokeLLMWithSpinner(summaryPrompt, verbose, true, !isGitHubEnabled);
  
}

export function removeFirstDirectory(inputPath: string): string {
  const normalizedPath = path.normalize(inputPath);
  const parts = normalizedPath.split(path.sep);
  if (parts.length > 1) {
    parts.shift();
  }
  return parts.join(path.sep);
}

/**
 * Fetches the list of files changed in the current PR.
 */
export function getChangedFiles(): string[] {
  try {
    const diffOutput = execSync("git diff --name-only origin/main").toString();
    return diffOutput
      .trim()
      .split("\n")
      .filter((file) => file.length > 0);
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

  reviewData.forEach((file) => {
    comment += `### **${file.file}**\n`;
    file.issues.forEach((issue: any) => {
      comment += `- 🔴 **Line ${issue.line}**: ${issue.message}\n`;
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

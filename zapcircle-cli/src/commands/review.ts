import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { writeOutputFile } from "../utils/writeOutputFile";

export async function review(options: { verbose?: boolean, output?: string, interactive?: boolean, github?: boolean }) {
  try {
    const outputDir = options.output || process.cwd();
    const isVerbose = options.verbose || false;
    const isInteractive = options.interactive || false;
    const isGitHubEnabled = options.github || false;

    console.log("🔍 Fetching changed files...");
    const changedFiles = getChangedFiles();

    if (changedFiles.length === 0) {
      console.log("✅ No files changed. Skipping review.");
      return;
    }

    console.log(`🧐 Analyzing ${changedFiles.length} modified files...`);

    let reviewResults: any[] = [];

    for (const filePath of changedFiles) {
      console.log(`🔎 Reviewing ${filePath}...`);
      const absolutePath = path.resolve(removeFirstDirectory(filePath));
      const fileContents = readFileSync(absolutePath, "utf-8");


      // Check if a `.zap.toml` behavior file exists
      const behaviorFilePath = `${absolutePath}.zap.toml`;
      let behaviorFileContents = "";
      if (existsSync(behaviorFilePath)) {
        behaviorFileContents = readFileSync(behaviorFilePath, "utf-8");
      }

      // Load diff for the file
      const fileDiff = getDiffForFile(filePath);
      
      // Construct prompt for LLM
      const reviewVariables = {
        name: path.basename(filePath),
        diff: fileDiff,
        behavior: behaviorFileContents,
      };

      const prompt = await loadPrompt("code", "review", reviewVariables);
      const result = await invokeLLMWithSpinner(prompt, isVerbose);

      reviewResults.push({ file: filePath, review: result });

      // Save review output as a TOML file
      const tomlVariables = { name: filePath, review: result };
      const tomlContents = toml.stringify(tomlVariables);
      const outputFilePath = path.join(outputDir, path.basename(filePath) + ".review.zap.toml");

      writeOutputFile(outputFilePath, tomlContents, isInteractive);
      console.log(`✅ Review generated: ${outputFilePath}`);
    }

    if (isGitHubEnabled) {
      console.log("📢 Posting review as a GitHub PR comment...");
      postGitHubComment(formatPRComment(reviewResults));
    }

    console.log("🚀 Review process completed!");
  } catch (error) {
    console.error("❌ Error reviewing PR:", error);
  }
}


function removeFirstDirectory(inputPath: string): string {
  const normalizedPath = path.normalize(inputPath); // Normalize the path
  const parts = normalizedPath.split(path.sep); // Split into parts using the path separator
  parts.shift(); // Remove the first element
  return parts.join(path.sep); // Join the remaining parts
}


/**
 * Fetches the list of files changed in the current PR.
 */
function getChangedFiles(): string[] {
  try {
    const diffOutput = execSync("git diff --name-only origin/main").toString();
    return diffOutput.trim().split("\n").filter(file => file.length > 0);
  } catch (error) {
    console.error("❌ Error fetching changed files:", error);
    return [];
  }
}

/**
 * Fetches the diff for a given file.
 */
function getDiffForFile(filePath: string): string {
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
function formatPRComment(reviewData: any[]): string {
  let comment = "🚀 **ZapCircle PR Review**\n\n✅ *Build Passed!*\n\n";

  reviewData.forEach(issue => {
    comment += `🔎 **${issue.file}**\n\`\`\`\n${issue.review}\n\`\`\`\n\n`;
  });

  comment += "**ZapCircle CI is non-blocking, but these improvements are recommended.**\n";
  return comment;
}

/**
 * Posts the review summary as a PR comment using the GitHub API.
 */
function postGitHubComment(comment: string) {
  const prNumber = process.env.GITHUB_REF?.match(/\d+/)?.[0];
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!prNumber || !repo || !token) {
    console.error("❌ GitHub PR review posting failed: Missing environment variables. Required - GITHUB_REF, GITHUB_REPOSITORY, GITHUB_TOKEN");
    return;
  }

  execSync(`curl -X POST -H "Authorization: token ${token}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${repo}/issues/${prNumber}/comments \
      -d '{"body": ${JSON.stringify(comment)}}'`);
}
// src/core/codeChangedProcessor.ts

import path from "path";
import { getChangedFiles, getDiffForFile } from "./diffCollector";
import { loadBehaviorFile } from "./behaviorLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { encode } from "gpt-tokenizer";

const DEFAULT_CONTEXT_LIMIT = 128000;

export interface FileReviewInput {
  fileName: string;
  fileDiff: string;
  behaviorFileContents?: string;
}

export interface FileReviewResult {
  fileName: string;
  issues: {
    line: string;
    severity: string;
    message: string;
  }[];
}

export interface SummaryInput {
  reviewData: string;
}

export interface ReviewOutput {
  reviewResults: FileReviewResult[];
  summary: string;
}

export interface PromptSet {
  fileReviewPrompt: (input: FileReviewInput) => Promise<string>;
  summaryPrompt: (input: SummaryInput) => Promise<string>;
}

export interface CodeChangeProcessorOptions {
  baseBranch?: string;
  contextLimit?: number;
  provider?: string;
  model?: string;
  verbose: boolean;
  promptSet: PromptSet;
}

export async function codeChangedProcessor(
  options: CodeChangeProcessorOptions,
): Promise<ReviewOutput> {
  const contextLimit = options.contextLimit || DEFAULT_CONTEXT_LIMIT;
  const baseBranch = options.baseBranch || "origin/main";

  const changedFiles = getChangedFiles(baseBranch);
  if (changedFiles.length === 0) {
    console.log("✅ No files changed.");
    return { reviewResults: [], summary: "No changes." };
  }

  const reviewResults: FileReviewResult[] = [];
  const codeToReview: any[] = [];
  let totalTokensUsed = 0;

  for (const filePath of changedFiles) {
    const fileName = path.basename(filePath);
    const fileDiff = getDiffForFile(filePath, baseBranch);
    const behaviorFileContents = loadBehaviorFile(filePath) || "";

    totalTokensUsed += estimateTokenCount(fileDiff);
    totalTokensUsed += estimateTokenCount(behaviorFileContents);

    if (totalTokensUsed > contextLimit) {
      console.warn(`Skipping ${filePath} to stay within token limit.`);
      continue;
    }

    codeToReview.push({
      fileName: filePath,
      fileDiff,
      behaviorFileContents,
    });

    const filePrompt = await options.promptSet.fileReviewPrompt({
      fileName,
      fileDiff,
      behaviorFileContents,
    });

    const rawResult = await invokeLLMWithSpinner(
      filePrompt,
      options.verbose,
      false,
      true,
      options.provider,
      options.model,
    );

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResult);
    } catch {
      console.error(`⚠️ Failed to parse LLM output for ${fileName}.`);
      continue;
    }

    reviewResults.push({
      fileName,
      issues: parsedResult.map((issue: any) => ({
        line: issue.line ?? "Unknown",
        severity: issue.severity ?? "Unknown",
        message: issue.message ?? "No description provided.",
      })),
    });
  }

  // Summary aggregation
  const summaryPrompt = await options.promptSet.summaryPrompt({
    reviewData: JSON.stringify(codeToReview),
  });

  const summary = await invokeLLMWithSpinner(
    summaryPrompt,
    options.verbose,
    false,
    true,
    options.provider,
    options.model,
  );

  return { reviewResults, summary };
}

function estimateTokenCount(text: string): number {
  return encode(text).length;
}

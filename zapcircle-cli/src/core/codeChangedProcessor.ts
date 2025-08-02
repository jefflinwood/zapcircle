import path from "path";
import { getChangedFiles, getSmartChunksForReview } from "./diffCollector";
import { loadBehaviorFile } from "./behaviorLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { encode } from "gpt-tokenizer";

const DEFAULT_CONTEXT_LIMIT = 128000;

export interface FileReviewInput {
  fileName: string;
  fileDiff: string;
  behaviorFileContents?: string;
}

export interface SummaryInput {
  reviewData: string;
}

// 🧬 NEW: Generic PromptSet interface
export interface PromptSet<TFileResult, TSummaryResult> {
  fileReviewPrompt: (input: FileReviewInput) => Promise<string>;
  fileReviewParser: (raw: string) => TFileResult;
  summaryPrompt: (input: SummaryInput) => Promise<string>;
  summaryParser: (raw: string) => TSummaryResult;
}

// 🧬 NEW: Fully generic processor options
export interface CodeChangeProcessorOptions<TFileResult, TSummaryResult> {
  baseBranch?: string;
  contextLimit?: number;
  provider?: string;
  model?: string;
  showSpinner: boolean;
  verbose: boolean;
  promptSet: PromptSet<TFileResult, TSummaryResult>;
}

// 🧬 NEW: Fully generic return type
export interface ReviewOutput<TFileResult, TSummaryResult> {
  reviewResults: {
    fileName: string;
    filePath: string;
    result: TFileResult;
  }[];
  summary: TSummaryResult;
}

export async function codeChangedProcessor<TFileResult, TSummaryResult>(
  options: CodeChangeProcessorOptions<TFileResult, TSummaryResult>,
): Promise<ReviewOutput<TFileResult, TSummaryResult>> {
  const contextLimit = options.contextLimit || DEFAULT_CONTEXT_LIMIT;
  const baseBranch = options.baseBranch || "origin/main";

  const changedFiles = getChangedFiles(baseBranch);
  if (changedFiles.length === 0) {
    console.log("✅ No files changed.");
    return { reviewResults: [], summary: {} as TSummaryResult };
  }

  const reviewResults: {
    fileName: string;
    filePath: string;
    result: TFileResult;
  }[] = [];
  const codeToReview: any[] = [];
  let totalTokensUsed = 0;

  for (const filePath of changedFiles) {
    const fileName = path.basename(filePath);
    const fileDiff = getSmartChunksForReview(filePath, baseBranch);
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
      options.showSpinner,
      options.provider,
      options.model,
    );

    let parsedResult: TFileResult;
    try {
      parsedResult = options.promptSet.fileReviewParser(rawResult);
    } catch {
      console.error(`⚠️ Failed to parse LLM output for ${fileName}.`);
      continue;
    }

    reviewResults.push({
      fileName,
      filePath,
      result: parsedResult,
    });
  }

  // Summary aggregation
  const summaryPrompt = await options.promptSet.summaryPrompt({
    reviewData: JSON.stringify(codeToReview),
  });

  const summaryRaw = await invokeLLMWithSpinner(
    summaryPrompt,
    options.verbose,
    false,
    options.showSpinner,
    options.provider,
    options.model,
  );

  let parsedSummary: TSummaryResult;
  try {
    parsedSummary = options.promptSet.summaryParser(summaryRaw);
  } catch {
    console.error("⚠️ Failed to parse summary output.");
    parsedSummary = {} as TSummaryResult;
  }

  return { reviewResults, summary: parsedSummary };
}

function estimateTokenCount(text: string): number {
  return encode(text).length;
}

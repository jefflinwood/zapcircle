// src/review/review.ts

import { loadPrompt } from "../core/promptLoader";
import { postGitHubComment } from "../core/postGitHubComment";
import { formatPRComment } from "../core/formatPRComment";
import {
  codeChangedProcessor,
  FileReviewInput,
  PromptSet,
  SummaryInput,
} from "../core/codeChangedProcessor";
import { isGitRepo } from "../core/diffCollector";
import { safeParseJSON } from "../utils/jsonUtils";

export interface FileReviewResult {
  issues: {
    line: string | number;
    severity: string;
    type: string;
    message: string;
  }[];
}

export async function review(options: {
  provider?: string;
  model?: string;
  verbose?: boolean;
  github?: boolean;
  contextLimit?: number;
  baseBranch?: string;
  output?: "text" | "json";
}) {
  if (!isGitRepo()) {
    console.warn("⚠️ Not a git repository.");
    return;
  }

  function mapFileReviewInput(vars: FileReviewInput): Record<string, string> {
    return {
      name: vars.fileName,
      diff: vars.fileDiff,
      behavior: vars.behaviorFileContents ?? "",
    };
  }

  function mapSummaryInput(vars: SummaryInput): Record<string, string> {
    return {
      reviewData: vars.reviewData,
    };
  }

  const promptSet: PromptSet<FileReviewResult, string> = {
    fileReviewPrompt: (vars) =>
      loadPrompt("code", "review", mapFileReviewInput(vars)),
    fileReviewParser: (raw) => safeParseJSON(raw),
    summaryPrompt: (vars) =>
      loadPrompt("pullrequest", "review", mapSummaryInput(vars)),
    summaryParser: (raw) => raw, // plain string summary for review
  };

  const showSpinner = !options.github && options.output !== "json";

  const result = await codeChangedProcessor({
    baseBranch: options.baseBranch,
    contextLimit: options.contextLimit,
    provider: options.provider,
    model: options.model,
    showSpinner: showSpinner,
    verbose: options.verbose || false,
    promptSet,
  });

  if (options.github) {
    console.log("Posting Comment to GitHub");
    await postGitHubComment(
      result.summary,
      formatPRComment(result.reviewResults),
    );
  } else {
    if (options.output === "json") {
      const flatResults = result.reviewResults.flatMap((fileReview) =>
        fileReview.result.issues.map((issue) => ({
          file: fileReview.fileName,
          path: fileReview.filePath,
          line: Number(issue.line),
          type: issue.type,
          severity: issue.severity,
          message: issue.message,
        })),
      );
      console.log(JSON.stringify(flatResults, null, 2));
    } else {
      console.log(result.summary);
      console.log(formatPRComment(result.reviewResults));
    }
  }
}

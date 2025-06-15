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

export async function review(options: {
  provider?: string;
  model?: string;
  verbose?: boolean;
  github?: boolean;
  contextLimit?: number;
  baseBranch?: string;
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

  const promptSet: PromptSet = {
    fileReviewPrompt: (vars) =>
      loadPrompt("code", "review", mapFileReviewInput(vars)),
    summaryPrompt: (vars) =>
      loadPrompt("pullrequest", "review", mapSummaryInput(vars)),
  };

  const result = await codeChangedProcessor({
    baseBranch: options.baseBranch,
    contextLimit: options.contextLimit,
    provider: options.provider,
    model: options.model,
    verbose: options.verbose || false,
    promptSet,
  });

  if (options.github) {
    await postGitHubComment(
      result.summary,
      formatPRComment(result.reviewResults),
    );
  } else {
    console.log(result.summary);
    console.log(formatPRComment(result.reviewResults));
  }
}

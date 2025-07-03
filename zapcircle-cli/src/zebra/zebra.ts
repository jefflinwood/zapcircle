import { loadPrompt } from "../core/promptLoader";
import { postGitHubComment } from "../core/postGitHubComment";
import { formatZebraPRComment } from "./formatZebraPRComment";
import { codeChangedProcessor, PromptSet } from "../core/codeChangedProcessor";
import { isGitRepo } from "../core/diffCollector";
import { BehaviorDriftResult, PRSummary } from "./zebraTypes";
import { parseBehaviorDrift, parsePRSummary } from "./zebraParsers";

export async function zebra(options: {
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

  const promptSet: PromptSet<BehaviorDriftResult, PRSummary> = {
    fileReviewPrompt: (vars) =>
      loadPrompt("behaviordiff", "zebra", mapFileReviewInput(vars)),
    fileReviewParser: parseBehaviorDrift,
    summaryPrompt: (vars) =>
      loadPrompt("prsummary", "zebra", mapSummaryInput(vars)),
    summaryParser: parsePRSummary,
  };

  const result = await codeChangedProcessor({
    baseBranch: options.baseBranch,
    contextLimit: options.contextLimit,
    provider: options.provider,
    model: options.model,
    showSpinner: !options.github,
    verbose: options.verbose || false,
    promptSet,
  });

  if (options.github) {
    await postGitHubComment(
      formatPRHeader(), // Optional: can define a Zebra header
      formatZebraPRComment(result.reviewResults, result.summary),
    );
  } else {
    console.log(formatZebraPRComment(result.reviewResults, result.summary));
  }
}

// Mapping functions for Zebra prompt variables
function mapFileReviewInput(vars: {
  fileName: string;
  fileDiff: string;
  behaviorFileContents?: string;
}): Record<string, string> {
  return {
    component: vars.fileName,
    diff: vars.fileDiff,
    behavior: vars.behaviorFileContents ?? "",
  };
}

function mapSummaryInput(vars: { reviewData: string }): Record<string, string> {
  return {
    behaviorReviews: vars.reviewData,
  };
}

// Optional: consistent header block
function formatPRHeader(): string {
  return "🦓 **ZEBRA Behavior Review**\n\n";
}

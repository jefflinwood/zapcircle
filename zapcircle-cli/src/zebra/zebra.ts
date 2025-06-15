import { loadPrompt } from "../core/promptLoader";
import { postGitHubComment } from "../core/postGitHubComment";
import { formatZebraPRComment } from "./formatZebraPRComment"; // We'll write this formatter
import { codeChangedProcessor, PromptSet } from "../core/codeChangedProcessor";
import { isGitRepo } from "../core/diffCollector";

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

  const promptSet: PromptSet = {
    fileReviewPrompt: (vars) =>
      loadPrompt("behaviordiff", "zebra", mapFileReviewInput(vars)),
    summaryPrompt: (vars) =>
      loadPrompt("prsummary", "zebra", mapSummaryInput(vars)),
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
      formatZebraPRComment(result.reviewResults),
    );
  } else {
    console.log(result.summary);
    console.log(formatZebraPRComment(result.reviewResults));
  }
}

// Mapping functions for Zebra prompt variables (matches your template keys)
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

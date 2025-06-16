import { PRSummary, BehaviorDriftResult } from "./zebraTypes";

export function formatZebraPRComment(
  reviewData: { fileName: string; result: BehaviorDriftResult }[],
  summaryData: PRSummary,
): string {
  let comment = "🦓 **ZEBRA Behavior Review**\n\n";

  comment += `### Summary\n`;
  summaryData.pullRequestBehaviorSummary.forEach((item) => {
    comment += `- ${item}\n`;
  });

  if (summaryData.breakingChanges.length > 0) {
    comment += `\n### 🚨 Breaking Changes\n`;
    summaryData.breakingChanges.forEach((item) => {
      comment += `- ${item}\n`;
    });
  }

  if (summaryData.reviewerAttention.length > 0) {
    comment += `\n### Reviewer Attention\n`;
    summaryData.reviewerAttention.forEach((item) => {
      comment += `- ${item}\n`;
    });
  }

  comment += `\n### Product Owner Summary\n`;
  comment += `${summaryData.productOwnerSummary}\n`;

  comment += `\n### Status Digest\n`;
  comment += `${summaryData.statusDigest}\n`;

  comment += `\n---\n\n### File-level Details\n`;

  reviewData.forEach((file) => {
    comment += `#### ${file.fileName}\n`;

    if (file.result.behaviorChanges.length === 0) {
      comment += `- No behavior changes detected.\n`;
    } else {
      file.result.behaviorChanges.forEach((change) => {
        comment += `- 🔎 ${change.message}\n`;
      });
    }

    if (file.result.breakingChanges.length > 0) {
      comment += `\n🚨 Breaking Changes:\n`;
      file.result.breakingChanges.forEach((bc) => {
        comment += `- ${bc}\n`;
      });
    }

    comment += `\n`;
  });

  return comment;
}

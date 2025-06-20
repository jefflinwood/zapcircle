// src/core/formatPRComment.ts

import { FileReviewResult } from "../commands/review";

export function formatPRComment(
  reviewData: { fileName: string; result: FileReviewResult }[],
): string {
  let comment = "";
  const iconMap: Record<string, string> = {
    low: "🟡",
    medium: "🟠",
    high: "🔴",
  };

  console.log("Review Data", reviewData);

  reviewData.forEach((file) => {
    comment += `### **${file.fileName}**\n`;
    file.result.issues.forEach((issue) => {
      const icon = iconMap[issue.severity] || "🟡";
      comment += `- ${icon} **Line ${issue.line}**: ${issue.type} - ${issue.message} \n`;
    });
    comment += `\n`;
  });

  if (reviewData.length > 0) {
    comment +=
      "**ZapCircle CI is non-blocking, but these improvements are recommended.**\n";
  }

  return comment;
}

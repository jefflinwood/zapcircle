// src/core/formatPRComment.ts

export function formatPRComment(reviewData: any[]): string {
  let comment = "";
  const iconMap: Record<string, string> = {
    low: "🟡",
    medium: "🟠",
    high: "🔴",
  };

  reviewData.forEach((file) => {
    comment += `### **${file.fileName}**\n`;
    file.issues.forEach((issue: any) => {
      const icon = iconMap[issue.severity] || "🟡";
      comment += `- ${icon} **Line ${issue.line}**: ${issue.message} \n`;
    });
    comment += `\n`;
  });

  if (reviewData.length > 0) {
    comment +=
      "**ZapCircle CI is non-blocking, but these improvements are recommended.**\n";
  }

  return comment;
}

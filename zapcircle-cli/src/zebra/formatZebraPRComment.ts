// src/zebra/formatZebraPRComment.ts

export function formatZebraPRComment(reviewData: any[]): string {
  let comment = "🦓 **ZEBRA Behavior Review**\n\n";

  reviewData.forEach((file) => {
    comment += `### ${file.fileName}\n`;
    file.issues.forEach((issue: any) => {
      comment += `- 🔎 ${issue.message}\n`;
    });
    comment += `\n`;
  });

  return comment;
}

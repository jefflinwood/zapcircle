// src/core/postGitHubComment.ts

export async function postGitHubComment(
  summary: string,
  reviewComment: string,
) {
  const prNumber = process.env.GITHUB_REF?.match(/\d+/)?.[0];
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!prNumber || !repo || !token) {
    console.error(
      "❌ GitHub PR review posting failed: Missing environment variables. Required - GITHUB_REF, GITHUB_REPOSITORY, GITHUB_TOKEN",
    );
    return;
  }

  const apiUrl = `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error when fetching comments: ${response.status} ${response.statusText}`,
      );
    }

    const comments = await response.json();
    const existingComment = comments.find((comment: any) =>
      comment.body.includes("🚀 **ZapCircle PR Review**"),
    );

    const newCommentBody = `🚀 **ZapCircle PR Review**\n\n${summary}\n\n${reviewComment}`;

    if (existingComment) {
      await fetch(
        `https://api.github.com/repos/${repo}/issues/comments/${existingComment.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: newCommentBody }),
        },
      );
      console.log("✅ Updated PR review comment.");
    } else {
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newCommentBody }),
      });
      console.log("✅ Posted new PR review comment.");
    }
  } catch (error) {
    console.error("❌ Error posting PR comment:", error);
  }
}

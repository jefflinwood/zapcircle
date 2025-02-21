import { execSync } from "child_process";
import {
  getChangedFiles,
  getDiffForFile,
  removeFirstDirectory,
  formatPRComment,
  generateSummary,
  postGitHubComment
} from "./review"; // Update the path to match your structure

jest.mock("child_process", () => ({
  execSync: jest.fn()
}));

jest.mock("../commandline/invokeLLMWithSpinner", () => ({
  invokeLLMWithSpinner: jest.fn(async () => "Mocked LLM Response")
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 123, body: "🚀 **ZapCircle PR Review**" }])
  })
) as jest.Mock;

describe("ZapCircle Review Tests", () => {


  /** ✅ Test removeFirstDirectory() */
  test("should remove the first directory from a path", () => {
    expect(removeFirstDirectory("src/components/Button.tsx")).toBe("components/Button.tsx");
    expect(removeFirstDirectory("app/models/User.ts")).toBe("models/User.ts");
  });

  test("should return the same path if no directory exists", () => {
    expect(removeFirstDirectory("index.ts")).toBe("index.ts");
  });

  /** ✅ Test formatPRComment() */
  test("should format PR comments correctly", () => {
    const reviewData = [
      { file: "file1.ts", issues: [{ line: 10, message: "Unused variable found" }] },
      { file: "file2.ts", issues: [{ line: 25, message: "Potential security risk" }] }
    ];

    const result = formatPRComment(reviewData);
    expect(result).toContain("file1.ts");
    expect(result).toContain("Line 10");
    expect(result).toContain("Unused variable found");
    expect(result).toContain("file2.ts");
    expect(result).toContain("Line 25");
    expect(result).toContain("Potential security risk");
  });

  test("should return an empty string if no issues found", () => {
    const result = formatPRComment([]);
    expect(result).toBe("");
  });

  /** ✅ Test postGitHubComment() */
  test("should update an existing PR comment if one exists", async () => {
    process.env.GITHUB_REF = "refs/pull/42/merge";
    process.env.GITHUB_REPOSITORY = "owner/repo";
    process.env.GITHUB_TOKEN = "mock-token";

    await postGitHubComment("Summary", "PR issues here");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/issues/comments/123",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ body: "🚀 **ZapCircle PR Review**\n\nSummary\n\nPR issues here" })
      })
    );
  });

  test("should create a new PR comment if none exist", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]) // No existing comment found
      })
    );

    process.env.GITHUB_REF = "refs/pull/42/merge";
    process.env.GITHUB_REPOSITORY = "owner/repo";
    process.env.GITHUB_TOKEN = "mock-token";

    await postGitHubComment("Summary", "PR issues here");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/issues/42/comments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ body: "🚀 **ZapCircle PR Review**\n\nSummary\n\nPR issues here" })
      })
    );
  });

  test("should log an error if posting a PR comment fails", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 500, statusText: "Internal Server Error" })
    );

    process.env.GITHUB_REF = "refs/pull/42/merge";
    process.env.GITHUB_REPOSITORY = "owner/repo";
    process.env.GITHUB_TOKEN = "mock-token";

    console.error = jest.fn(); // Mock console.error

    await postGitHubComment("Summary", "PR issues here");

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
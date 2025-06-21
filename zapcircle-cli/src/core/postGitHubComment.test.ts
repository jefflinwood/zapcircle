import { execSync } from "child_process";

import { postGitHubComment } from "./postGitHubComment";

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("../commandline/invokeLLMWithSpinner", () => ({
  invokeLLMWithSpinner: jest.fn(async () => "Mocked LLM Response"),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: 123, body: "\ud83d\ude80 **ZapCircle PR Review**" },
      ]),
  }),
) as jest.Mock;

describe("ZapCircle Post GitHub Comment Tests", () => {
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
        body: JSON.stringify({
          body: "\ud83d\ude80 **ZapCircle PR Review**\n\nSummary\n\nPR issues here",
        }),
      }),
    );
  });

  test("should create a new PR comment if none exist", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // No existing comment found
      }),
    );

    process.env.GITHUB_REF = "refs/pull/42/merge";
    process.env.GITHUB_REPOSITORY = "owner/repo";
    process.env.GITHUB_TOKEN = "mock-token";

    await postGitHubComment("Summary", "PR issues here");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/issues/42/comments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          body: "\ud83d\ude80 **ZapCircle PR Review**\n\nSummary\n\nPR issues here",
        }),
      }),
    );
  });

  test("should log an error if posting a PR comment fails", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    );

    process.env.GITHUB_REF = "refs/pull/42/merge";
    process.env.GITHUB_REPOSITORY = "owner/repo";
    process.env.GITHUB_TOKEN = "mock-token";

    console.error = jest.fn(); // Mock console.error

    await postGitHubComment("Summary", "PR issues here");

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

import { execSync } from "child_process";

import { formatPRComment } from "./formatPRComment";

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

describe("ZapCircle Format PR Comment Tests", () => {
  /** ✅ Test formatPRComment() */
  test("should format PR comments correctly", () => {
    const reviewData = [
      {
        fileName: "file1.ts",
        issues: [
          { line: 10, severity: "low", message: "Unused variable found" },
        ],
      },
      {
        fileName: "file2.ts",
        issues: [
          { line: 25, severity: "high", message: "Potential security risk" },
        ],
      },
    ];

    const result = formatPRComment(reviewData);
    expect(result).toContain("file1.ts");
    expect(result).toContain("Line 10");
    expect(result).toContain("Unused variable found");
    expect(result).toContain("file2.ts");
    expect(result).toContain("Line 25");
    expect(result).toContain("Potential security risk");
    expect(result).toContain("\ud83d\udd34");
  });

  test("should return an empty string if no issues found", () => {
    const result = formatPRComment([]);
    expect(result).toBe("");
  });
});

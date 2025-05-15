import { runAgentOnIssue } from "./run";
import { writeOutputFile } from "../utils/writeOutputFile";
import { writeIssueLog } from "./writeIssueLog";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { AgentIssue } from "../issues/types";

jest.mock("../context/index", () => ({
  buildContextForComponent: jest.fn(() => ({
    entryFile: "src/components/LoginForm.jsx",
    files: { "src/components/LoginForm.jsx": "<code />" },
    behaviorFile: "src/components/LoginForm.zap.toml",
  })),
}));

jest.mock("./promptBuilder", () => ({
  renderGenerationPrompt: jest.fn(() => "GENERATE_PROMPT"),
}));

jest.mock("./renderReviewPrompt", () => ({
  renderReviewPrompt: jest.fn(
    ({ generatedCode }) => `REVIEW_PROMPT for: ${generatedCode.slice(0, 20)}`,
  ),
}));

jest.mock("../commandline/invokeLLMWithSpinner");
jest.mock("../utils/writeOutputFile");
jest.mock("./writeIssueLog");
jest.mock("../behaviors/matcher", () => ({
  findBehaviorForIssue: jest.fn(() => "src/components/LoginForm.zap.toml"),
}));
jest.mock("../behaviors/findComponent", () => ({
  findLikelyComponentForIssue: jest.fn(() => "src/components/LoginForm.jsx"),
}));
jest.mock("../behaviors/resolveComponentFromBehavior", () => ({
  resolveComponentFromBehavior: jest.fn(() => "src/components/LoginForm.jsx"),
}));
jest.mock("../behaviors/ensureBehaviorForComponent", () => ({
  ensureBehaviorForComponent: jest.fn(
    () => "src/components/LoginForm.zap.toml",
  ),
}));

const mockInvoke = invokeLLMWithSpinner as jest.Mock;

describe("runAgentOnIssue", () => {
  const mockIssue: AgentIssue = {
    id: 42,
    title: "Fix login redirect",
    status: "pending",
    author: "Mock Author",
    source: "github",
    createdAt: "",
    description: "Redirect after login is broken",
    priority: "High",
    comments: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("writes output and logs issue when review passes", async () => {
    mockInvoke
      .mockResolvedValueOnce("<code />") // generation
      .mockResolvedValueOnce("APPROVED: looks good!"); // review

    await runAgentOnIssue(mockIssue);

    expect(writeOutputFile).toHaveBeenCalled();
    expect(writeIssueLog).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        status: "completed",
        reviewPassed: true,
      }),
    );
  });

  it("retries once and fails if review fails twice", async () => {
    mockInvoke
      .mockResolvedValueOnce("<bad code />") // generation
      .mockResolvedValueOnce("REJECTED: unsafe hook") // first review
      .mockResolvedValueOnce("<retry code />") // second gen
      .mockResolvedValueOnce("REJECTED: still wrong"); // second review

    await runAgentOnIssue(mockIssue);

    expect(writeOutputFile).not.toHaveBeenCalled();
    expect(writeIssueLog).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        status: "failed",
        reviewPassed: false,
        failureReason: expect.stringContaining("Second review failed"),
      }),
    );
  });

  it("fails immediately if component cannot be resolved", async () => {
    const { findBehaviorForIssue } = await import("../behaviors/matcher");
    (findBehaviorForIssue as jest.Mock).mockReturnValue(undefined);
    const { findLikelyComponentForIssue } = await import(
      "../behaviors/findComponent"
    );
    (findLikelyComponentForIssue as jest.Mock).mockReturnValue(undefined);

    await runAgentOnIssue(mockIssue);

    expect(writeOutputFile).not.toHaveBeenCalled();
    expect(writeIssueLog).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        status: "failed",
        failureReason: expect.stringContaining(
          "Could not guess component file",
        ),
      }),
    );
  });
});

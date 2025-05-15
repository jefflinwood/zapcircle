import * as platformUtils from "../utils/platformUtils";
import { listIssues, readIssueSync, writeIssue, logIssueSyncEvent } from "./index";
import toml from "@iarna/toml";
import path from "path";
import { AgentIssue } from "./types";

const fakeIssue = {
  id: 42,
  source: "chat",
  status: "pending",
  priority: "High",
  title: "Fix login redirect",
  description: "Redirect to /dashboard",
  createdAt: "2025-05-13T14:00:00Z",
  author: "jeff.linwood",
  comments: [],
} as AgentIssue;

const fakeHomeDir = "/home/testuser";
const fakeCwd = "/projects/fake";
const fakeIssuesDir = path.join(fakeCwd, ".zapcircle/agent/issues");

describe("Issue Store with spies", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(platformUtils, "getHomeDir").mockReturnValue(fakeHomeDir);
    jest.spyOn(platformUtils, "getCurrentDir").mockReturnValue(fakeCwd);

    jest.spyOn(platformUtils, "readDirSync").mockReturnValue(["42.toml"]);

    jest.spyOn(platformUtils, "readFile").mockImplementation((filepath) => {
      if (filepath.endsWith(".toml")) return toml.stringify(fakeIssue);
      if (filepath.endsWith("sync.log.jsonl")) return "";
      return "";
    });

    jest.spyOn(platformUtils, "writeFile").mockImplementation(() => {});
    jest.spyOn(platformUtils, "pathExists").mockImplementation(() => true);
    jest.spyOn(platformUtils, "createDirectory").mockImplementation((p:string) => "");
  });

  it("reads an issue from disk", () => {
    const issue = readIssueSync(42);
    expect(issue.id).toBe(42);
    expect(issue.title).toMatch(/login/i);
  });

  it("writes an issue to disk and logs it", () => {
    writeIssue(fakeIssue);
    expect(platformUtils.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("42.toml"),
      expect.stringContaining("Fix login redirect")
    );
  });

  it("filters issues by status", () => {
    const results = listIssues({ status: "completed" });
    expect(results).toHaveLength(0);
  });

  it("logs a manual sync event", () => {
    logIssueSyncEvent({
      timestamp: "2025-05-13T14:22:00Z",
      issueId: 42,
      action: "pull",
      source: "github",
    });

    expect(platformUtils.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("sync.log.jsonl"),
      expect.stringContaining("pull")
    );
  });
});
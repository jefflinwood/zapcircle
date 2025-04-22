import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { checkZapCircleStatus } from "../commands/status";

jest.mock("fs");
jest.mock("os");

describe("checkZapCircleStatus", () => {
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prints full status when user and project config files exist", () => {
    const mockedFs = fs as jest.Mocked<typeof fs>;
    const mockedOs = os as jest.Mocked<typeof os>;

    // Setup fake paths
    const fakeHomeDir = "/fake/home";
    const fakeCwd = "/fake/project";

    mockedOs.homedir.mockReturnValue(fakeHomeDir);
    jest.spyOn(process, "cwd").mockReturnValue(fakeCwd);

    const userConfigPath = path.join(fakeHomeDir, ".zapcircle", "zapcircle.cli.toml");
    const projectConfigPath = path.join(fakeCwd, "zapcircle.config.toml");

    mockedFs.existsSync.mockImplementation((filepath) => {
      return (
        filepath === userConfigPath || filepath === projectConfigPath
      );
    });

    mockedFs.readFileSync.mockImplementation((filepath: any) => {
      if (filepath === userConfigPath) {
        return `
          provider = "openai"

          [models]
          large = "gpt-4o"
          small = "gpt-4o-mini"

          [openai]
          apiKey = "sk-test"

          [local]
          baseUrl = "http://localhost:1234"
        `;
      }
      if (filepath === projectConfigPath) {
        return `
          [prompts]
          all = ".zapcircle/prompts/shared.txt"
          analyze = ".zapcircle/prompts/analyze.txt"
          generate = ".zapcircle/prompts/generate.txt"

          [filetype.generate]
          jsx = ".zapcircle/prompts/generate-jsx.txt"
        `;
      }
      return "";
    });

    checkZapCircleStatus();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Provider: openai"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Large Model: gpt-4o"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Small Model: gpt-4o-mini"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("OpenAI: ✅ Configured"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Local LLM: ✅ Configured (http://localhost:1234)"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("📁 Project Configuration: ✅ Found"));
  });
});
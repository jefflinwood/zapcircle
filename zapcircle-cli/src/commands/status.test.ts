import * as platformUtils from "../utils/platformUtils";
import { checkZapCircleStatus } from "../commands/status";

describe("checkZapCircleStatus", () => {
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();

    // Fake paths
    const fakeHomeDir = "/fake/home";
    const fakeCwd = "/fake/project";
    const userConfigPath = `${fakeHomeDir}/.zapcircle/zapcircle.cli.toml`;
    const projectConfigPath = `${fakeCwd}/zapcircle.config.toml`;

    // ✅ Platform utils mocks
    jest.spyOn(platformUtils, "getHomeDir").mockReturnValue(fakeHomeDir);
    jest.spyOn(platformUtils, "getCurrentDir").mockReturnValue(fakeCwd);
    jest.spyOn(platformUtils, "pathExists").mockImplementation((filepath) => {
      return filepath === userConfigPath || filepath === projectConfigPath;
    });

    jest.spyOn(platformUtils, "readFile").mockImplementation((filepath: string) => {
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("prints full status when user and project config files exist", () => {
    checkZapCircleStatus();

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Provider: openai"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Large Model: gpt-4o"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Small Model: gpt-4o-mini"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("OpenAI: ✅ Configured"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("Local LLM: ✅ Configured (http://localhost:1234)"));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("📁 Project Configuration: ✅ Found"));
  });
});
import * as readline from "readline";
import * as path from "path";
import * as platformUtils from "../utils/platformUtils";

import { configureZapCircle } from "../commands/configure";
import * as configModule from "../core/config";

jest.mock("../core/config");

describe("configureZapCircle", () => {
  const fakeHomeDir = "/fake/home";
  const fakeConfigPath = path.join(
    fakeHomeDir,
    ".zapcircle",
    "zapcircle.cli.toml",
  );

  const mockQuestions = [
    "openai", // provider
    "gpt-4o", // large model
    "gpt-4o-mini", // small model
    "sk-test", // OpenAI key
    "", // Anthropic key
    "", // Google key
    "http://localhost:1234", // Local URL
  ];

  let questionIndex = 0;

  beforeEach(() => {
    questionIndex = 0;

    jest.spyOn(platformUtils, "getHomeDir").mockReturnValue(fakeHomeDir);
    jest.spyOn(platformUtils, "getHomeDir").mockReturnValue("/fake/home");
    jest.spyOn(platformUtils, "pathExists").mockReturnValue(false);
    jest
      .spyOn(platformUtils, "createDirectory")
      .mockImplementation(() => undefined);
    jest.spyOn(platformUtils, "writeFile").mockImplementation(() => {});

    jest.spyOn(configModule, "loadUserConfig").mockReturnValue({});

    // Mock readline
    jest.spyOn(platformUtils, "createReadlineInterface").mockReturnValue({
      question(prompt: string, cb: (answer: string) => void) {
        cb(mockQuestions[questionIndex++] ?? "");
      },
      close() {},
    } as unknown as readline.Interface);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should configure zapcircle CLI correctly", async () => {
    await configureZapCircle();

    expect(platformUtils.createDirectory).toHaveBeenCalledWith(
      path.join(fakeHomeDir, ".zapcircle"),
    );
    expect(platformUtils.writeFile).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining('provider = "openai"'),
    );
  });
});

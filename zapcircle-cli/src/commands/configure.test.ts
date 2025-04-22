import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { configureZapCircle } from "../commands/configure";
import { loadUserConfig } from "../core/config";

jest.mock("fs");
jest.mock("os", () => {
    const actualOs = jest.requireActual("os");
    return {
      ...actualOs,
      homedir: jest.fn(), // now it's a mock function
    };
  });

import * as os from "os";

jest.mock("readline");
jest.mock("../core/config");

describe("configureZapCircle", () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;
  const mockedOs = os as jest.Mocked<typeof os>;
  const mockedReadline = readline as jest.Mocked<typeof readline>;
  const mockedLoadUserConfig = loadUserConfig as jest.Mock;

  const fakeHomeDir = "/fake/home";
  const fakeConfigPath = path.join(fakeHomeDir, ".zapcircle", "zapcircle.cli.toml");

  const mockQuestions = [
    "openai",         // provider
    "gpt-4o",         // large model
    "gpt-4o-mini",    // small model
    "sk-test",        // OpenAI key
    "",               // Anthropic key
    "",               // Google key
    "http://localhost:1234", // Local URL
  ];

  let questionIndex = 0;

  beforeEach(() => {
    questionIndex = 0;
    mockedOs.homedir.mockReturnValue(fakeHomeDir);
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockImplementation(() => {});
    mockedLoadUserConfig.mockReturnValue({});

    // Mock readline interface
    mockedReadline.createInterface.mockReturnValue({
      question: (_: string, cb: (ans: string) => void) => cb(mockQuestions[questionIndex++]),
      close: () => {},
    } as any);
  });

  it("writes the user config with expected values", async () => {
    await configureZapCircle();

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(path.join(fakeHomeDir, ".zapcircle"));
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`provider = "openai"`),
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`[openai]\napiKey = "sk-test"`),
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`[local]\nbaseUrl = "http://localhost:1234"`),
    );
  });

  it("uses fallback values from existing config", async () => {
    mockedLoadUserConfig.mockReturnValue({
      provider: "anthropic",
      models: {
        large: "claude-3",
        small: "claude-3-haiku",
      },
      openai: { apiKey: "already-set" },
    });

    mockQuestions.splice(0, mockQuestions.length, "", "", "", "", "", "", "");

    await configureZapCircle();

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`provider = "anthropic"`),
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`[openai]\napiKey = "already-set"`),
    );
    expect(mockedFs.writeFileSync).not.toHaveBeenCalledWith(
      fakeConfigPath,
      expect.stringContaining(`[anthropic]`),
    );
  });
});
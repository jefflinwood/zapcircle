import * as platformUtils from "../utils/platformUtils";
import path from "path";
import { generateComponent } from "./generate";
import * as llmSpinner from "../commandline/invokeLLMWithSpinner";
import * as promptLoader from "../core/promptLoader";
import * as writeModule from "../utils/writeOutputFile"

// Mock LLM-related modules
jest.mock("../core/promptLoader");
beforeEach(() => {
  jest.spyOn(promptLoader, "loadPrompt").mockResolvedValue("Mocked LLM Generation Prompt");
});

jest.mock("../commandline/invokeLLMWithSpinner");
beforeEach(() => {
  jest.spyOn(llmSpinner, "invokeLLMWithSpinner").mockResolvedValue("Mocked LLM Generated Code");
});


// Mock writeOutputFile and track it
const mockWriteOutputFile = jest.fn((filePath: string, contents: string) => {
  // Simulate writing (in-memory, no-op)
});

jest.mock("../utils/writeOutputFile");


jest.spyOn(writeModule, "writeOutputFile").mockImplementation(
  (filePath: string, contents: string, isInteractive?: boolean) => {
    mockWriteOutputFile(filePath, contents);
  }
);

describe("generateComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(platformUtils, "readFile").mockImplementation((filePath: string) => {
      if (filePath.includes("Button.tsx.zap.toml")) {
        return `name = "Button.tsx"\nbehavior = "A simple button component with a click handler."`;
      }
      if (filePath.includes("Input.tsx.zap.toml")) {
        return `name = "Input.tsx"\nbehavior = "An input component that takes user text input."`;
      }
      throw new Error("File not found");
    });

    jest.spyOn(platformUtils, "pathExists").mockImplementation((filePath: string) => {
      return filePath.includes("Button.tsx.zap.toml") || filePath.includes("Input.tsx.zap.toml");
    });

    jest.spyOn(platformUtils, "writeFile").mockImplementation(() => {
      // no-op
    });
  });

  it("generates a component file from a .zap.toml file", async () => {
    const inputFile = "test-project/components/Button.tsx.zap.toml";
    const outputDir = "test-project/output";
    const outputPath = path.join(outputDir, "Button.tsx");

    await generateComponent("tsx", inputFile, { output: outputDir });

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });

  it("handles multiple .zap.toml files correctly", async () => {
    const inputFile = "test-project/components/Input.tsx.zap.toml";
    const outputDir = "test-project/output";
    const outputPath = path.join(outputDir, "Input.tsx");

    await generateComponent("tsx", inputFile, { output: outputDir });

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });

  it("handles missing .zap.toml file gracefully", async () => {
    const inputFile = "test-project/components/NonExistent.tsx.zap.toml";
    await expect(generateComponent("tsx", inputFile, { output: "test-project/output" }))
      .resolves.not.toThrow();
  });

  it("generates the component in the same directory if no output is specified", async () => {
    const inputFile = "test-project/components/Button.tsx.zap.toml";
    const outputPath = "test-project/components/Button.tsx";

    await generateComponent("tsx", inputFile, {});

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });
});
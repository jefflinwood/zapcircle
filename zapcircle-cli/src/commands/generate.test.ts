import mockFs from "mock-fs";
import path from "path";
import { generateComponent } from "./generate";
import { readFileSync, existsSync } from "fs";

// Mock dependencies
jest.mock("../core/promptLoader", () => ({
  loadPrompt: jest.fn().mockResolvedValue("Mocked LLM Generation Prompt"),
}));

jest.mock("../commandline/invokeLLMWithSpinner", () => ({
  invokeLLMWithSpinner: jest.fn().mockResolvedValue("Mocked LLM Generated Code"),
}));

const mockWriteOutputFile = jest.fn((filePath: string, contents: string) => {
  require("fs").writeFileSync(filePath, contents);
});

jest.mock("../utils/writeOutputFile", () => ({
  writeOutputFile: (filePath: string, contents: string, _interactive: boolean) => {
    mockWriteOutputFile(filePath, contents);
  },
}));

describe("generateComponent", () => {
  beforeEach(() => {
    mockFs({
      "test-project": {
        "components": {
          "Button.tsx.zap.toml": `
            name = "Button.tsx"
            behavior = "A simple button component with a click handler."
          `,
          "Input.tsx.zap.toml": `
            name = "Input.tsx"
            behavior = "An input component that takes user text input."
          `,
        },
        "output": {
          "placeholder.txt": "This ensures the directory exists."
        },
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
    jest.clearAllMocks();
  });

  it("generates a component file from a .zap.toml file", async () => {
    await generateComponent("tsx", "test-project/components/Button.tsx.zap.toml", { output: "test-project/output" });

    const outputPath = path.join("test-project/output", "Button.tsx");

    expect(existsSync(outputPath)).toBe(true);

    const generatedCode = readFileSync(outputPath, "utf-8");
    expect(generatedCode).toBe("Mocked LLM Generated Code");

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });

  it("handles multiple .zap.toml files correctly", async () => {
    await generateComponent("tsx", "test-project/components/Input.tsx.zap.toml", { output: "test-project/output" });

    const outputPath = path.join("test-project/output", "Input.tsx");

    expect(existsSync(outputPath)).toBe(true);

    const generatedCode = readFileSync(outputPath, "utf-8");
    expect(generatedCode).toBe("Mocked LLM Generated Code");

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });

  it("handles missing .zap.toml file gracefully", async () => {
    await expect(generateComponent("tsx", "test-project/components/NonExistent.tsx.zap.toml", { output: "test-project/output" }))
      .resolves.not.toThrow();
  });

  it("generates the component in the same directory if no output is specified", async () => {
    await generateComponent("tsx", "test-project/components/Button.tsx.zap.toml", {});

    const outputPath = path.join("test-project/components", "Button.tsx");

    expect(existsSync(outputPath)).toBe(true);

    const generatedCode = readFileSync(outputPath, "utf-8");
    expect(generatedCode).toBe("Mocked LLM Generated Code");

    expect(mockWriteOutputFile).toHaveBeenCalledWith(outputPath, "Mocked LLM Generated Code");
  });
});
import mockFs from "mock-fs";
import path from "path";
import { analyze } from "./analyze";
import { readFileSync, existsSync } from "fs";

// Mock the prompt loading and LLM invocation
jest.mock("../core/promptLoader", () => ({
  loadPrompt: jest.fn().mockResolvedValue("Mocked LLM Prompt"),
}));

jest.mock("../commandline/invokeLLMWithSpinner", () => ({
  invokeLLMWithSpinner: jest.fn().mockResolvedValue("Mocked LLM Analysis Result"),
}));

// Capture written output
const mockWriteOutputFile = jest.fn((filePath: string, contents: string) => {
  require("fs").writeFileSync(filePath, contents);
});

jest.mock("../utils/writeOutputFile", () => ({
  writeOutputFile: (filePath: string, contents: string, _interactive: boolean) => {
    mockWriteOutputFile(filePath, contents);
  },
}));

describe("analyze", () => {
  beforeEach(() => {
    mockFs({
      "test-project": {
        "components": {
          "Button.tsx": "export function Button() { return <button>Click</button>; }",
          "Input.tsx": "export function Input() { return <input />; }",
        },
        "output": {
            "placeholder.txt": "something"
        },
        "utils": {
          "helpers.ts": "export function helper() { return 'help'; }",
        },
        ".gitignore": "node_modules\n.env",
        "node_modules": {
          "some-package": {
            "index.js": "console.log('Ignored package');",
          },
        },
        ".env": "SECRET_KEY=12345",
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
    jest.clearAllMocks();
  });

  it("analyzes .tsx files and generates .zap.toml outputs", async () => {
    await analyze("tsx", "test-project/components", { output: "test-project/output" });

    const outputPathButton = path.join("test-project/output", "Button.tsx.zap.toml");
    const outputPathInput = path.join("test-project/output", "Input.tsx.zap.toml");

    expect(existsSync(outputPathButton)).toBe(true);
    expect(existsSync(outputPathInput)).toBe(true);

    const buttonOutput = readFileSync(outputPathButton, "utf-8");
    const inputOutput = readFileSync(outputPathInput, "utf-8");

    expect(buttonOutput).toContain('name = "Button.tsx"');
    expect(buttonOutput).toContain('behavior = "Mocked LLM Analysis Result"');

    expect(inputOutput).toContain('name = "Input.tsx"');
    expect(inputOutput).toContain('behavior = "Mocked LLM Analysis Result"');
  });

  it("handles missing directories gracefully", async () => {
    await expect(analyze("tsx", "non-existent-directory", { output: "test-project/output" }))
      .resolves.not.toThrow();
  });

  it("analyzes TypeScript utility files correctly", async () => {
    await analyze("ts", "test-project/utils", { output: "test-project/output" });

    const helpersOutputPath = path.join("test-project/output", "helpers.ts.zap.toml");
    expect(existsSync(helpersOutputPath)).toBe(true);

    const helpersOutput = readFileSync(helpersOutputPath, "utf-8");

    expect(helpersOutput).toContain('name = "helpers.ts"');
    expect(helpersOutput).toContain('behavior = "Mocked LLM Analysis Result"');
  });
});
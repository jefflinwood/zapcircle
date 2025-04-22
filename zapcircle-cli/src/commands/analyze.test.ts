import path from "path";
import * as platformUtils from "../utils/platformUtils";
import { analyze } from "./analyze";
import fs from "fs";

// Mock LLM modules
jest.mock("../core/promptLoader", () => ({
  loadPrompt: jest.fn().mockResolvedValue("Mocked LLM Prompt"),
}));

jest.mock("../commandline/invokeLLMWithSpinner", () => ({
  invokeLLMWithSpinner: jest.fn().mockResolvedValue("Mocked LLM Analysis Result"),
}));

const mockWriteOutputFile = jest.fn((filePath: string, contents: string) => {
  // Simulate write
});

jest.mock("../utils/writeOutputFile", () => ({
  writeOutputFile: (filePath: string, contents: string, _interactive: boolean) => {
    mockWriteOutputFile(filePath, contents);
  },
}));

describe("analyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Simulated file structure (flat)
    const fileMap: Record<string, string> = {
      "test-project/components/Button.tsx": "export function Button() { return <button>Click</button>; }",
      "test-project/components/Input.tsx": "export function Input() { return <input />; }",
      "test-project/utils/helpers.ts": "export function helper() { return 'help'; }",
    };

    // Simulate directory contents
    const dirContents: Record<string, string[]> = {
      "test-project/components": [
        "Button.tsx",
        "Input.tsx",
      ],
      "test-project/utils": [
        "helpers.ts",
      ],
    };

    // ✅ Mock readFile
    jest.spyOn(platformUtils, "readFile").mockImplementation((filePath: string) => {
      if (fileMap[filePath]) return fileMap[filePath];
      throw new Error("File not found: " + filePath);
    });

    // ✅ Mock writeFile
    jest.spyOn(platformUtils, "writeFile").mockImplementation((_filePath: string, _contents: string) => {
      // no-op
    });

    // ✅ Mock readDir
    jest.spyOn(platformUtils, "readDir").mockImplementation((dirPath: string) => {
      return dirContents[dirPath] ?? [];
    });

    // ✅ Mock stat
    jest.spyOn(platformUtils, "stat").mockImplementation((filePath: string) => {
      const isDir = Object.keys(dirContents).includes(filePath);
      const isFile = Object.keys(fileMap).includes(filePath);

      return {
        isDirectory: () => isDir,
        isFile: () => isFile,
      } as unknown as fs.Stats;
    });
  });

  it("analyzes .tsx files and generates .zap.toml outputs", async () => {
    await analyze("tsx", "test-project/components", { output: "test-project/output" });

    const expectedPaths = [
      path.join("test-project/output", "Button.tsx.zap.toml"),
      path.join("test-project/output", "Input.tsx.zap.toml"),
    ];

    for (const filePath of expectedPaths) {
      expect(mockWriteOutputFile).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining("behavior = \"Mocked LLM Analysis Result\"")
      );
    }
  });

  it("handles missing directories gracefully", async () => {
    // Simulate no files for this path
    jest.spyOn(platformUtils, "readDir").mockImplementation((dirPath: string) => {
      if (dirPath === "non-existent-directory") return [];
      return [];
    });

    jest.spyOn(platformUtils, "stat").mockImplementation((filePath: string) => {
      return {
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats;
    });

    await expect(analyze("tsx", "non-existent-directory", { output: "test-project/output" }))
      .resolves.not.toThrow();
  });

  it("analyzes TypeScript utility files correctly", async () => {
    await analyze("ts", "test-project/utils", { output: "test-project/output" });

    const expectedPath = path.join("test-project/output", "helpers.ts.zap.toml");
    expect(mockWriteOutputFile).toHaveBeenCalledWith(
      expectedPath,
      expect.stringContaining("name = \"helpers.ts\"")
    );
    expect(mockWriteOutputFile).toHaveBeenCalledWith(
      expectedPath,
      expect.stringContaining("behavior = \"Mocked LLM Analysis Result\"")
    );
  });
});
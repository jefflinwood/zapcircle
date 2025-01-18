import mockFs from "mock-fs";
import path from "path";
import { loadPrompt } from "./promptLoader";

describe("loadPrompt", () => {
  beforeEach(() => {
    // Set up a mocked file system before each test
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {
        "example.txt": "Hello, ${name}!",
      },
      [path.resolve(__dirname, "../prompts/generate")]: {
        "example.txt": "Welcome, ${user}!",
      },
    });
  });

  afterEach(() => {
    // Restore the actual file system after each test
    mockFs.restore();
  });

  it("loads a project-specific prompt when it exists", async () => {
    const result = await loadPrompt("example", "generate", { name: "ZapCircle" });

    expect(result).toBe("Hello, ZapCircle!");
  });

  it("falls back to loading a default prompt when project-specific prompt does not exist", async () => {
    // Remove the project-specific file from the mock file system
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {},
      [path.resolve(__dirname, "../prompts/generate")]: {
        "example.txt": "Welcome, ${user}!",
      },
    });

    const result = await loadPrompt("example", "generate", { user: "Developer" });

    expect(result).toBe("Welcome, Developer!");
  });

  it("throws an error when no prompt is found", async () => {
    // Remove both project-specific and default prompts
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {},
      [path.resolve(__dirname, "../prompts/generate")]: {},
    });

    await expect(loadPrompt("example", "generate", {})).rejects.toThrowError("Prompt template not found: example");
  });

  it("interpolates variables in the template", async () => {
    const result = await loadPrompt("example", "generate", { name: "John Doe" });

    expect(result).toBe("Hello, John Doe!");
  });

  it("uses empty string for missing variables", async () => {
    const result = await loadPrompt("example", "generate", {});

    expect(result).toBe("Hello, !");
  });
});
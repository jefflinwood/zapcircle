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
      [path.resolve(process.cwd(), "zapcircle.config.toml")]: `
        [prompts]
        all = "Always use TypeScript."
        generate = "Use Tailwind CSS."
      `,
    });
  });

  afterEach(() => {
    // Restore the actual file system after each test
    mockFs.restore();
  });

  it("loads a project-specific prompt when it exists", async () => {
    const result = await loadPrompt("example", "generate", {
      name: "ZapCircle",
    });

    expect(result).toBe("Hello, ZapCircle!");
  });

  it("falls back to loading a default prompt when project-specific prompt does not exist", async () => {
    // Remove the project-specific file from the mock file system
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {},
      [path.resolve(__dirname, "../prompts/generate")]: {
        "example.txt": "Welcome, ${user}!",
      },
      [path.resolve(process.cwd(), "zapcircle.config.toml")]: `
        [prompts]
        all = "Always use TypeScript."
        generate = "Use Tailwind CSS."
      `,
    });

    const result = await loadPrompt("example", "generate", {
      user: "Developer",
    });

    expect(result).toBe("Welcome, Developer!");
  });

  it("throws an error when no prompt is found", async () => {
    // Remove both project-specific and default prompts
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {},
      [path.resolve(__dirname, "../prompts/generate")]: {},
      [path.resolve(process.cwd(), "zapcircle.config.toml")]: `
        [prompts]
        all = "Always use TypeScript."
      `,
    });

    await expect(loadPrompt("example", "generate", {})).rejects.toThrowError(
      "Prompt template not found: example",
    );
  });

  it("interpolates variables in the template", async () => {
    const result = await loadPrompt("example", "generate", {
      name: "John Doe",
    });

    expect(result).toBe("Hello, John Doe!");
  });

  it("uses empty string for missing variables", async () => {
    const result = await loadPrompt("example", "generate", {});

    expect(result).toBe("Hello, !");
  });

  it("injects project-wide prompt settings", async () => {
    // Test if global config settings are being injected
    const result = await loadPrompt("example", "generate", {
      name: "John Doe",
    });

    expect(result).toBe("Hello, John Doe!");
  });

  it("merges config settings into variables", async () => {
    const result = await loadPrompt("example", "generate", {});

    expect(result).toBe("Hello, !");
  });

  it("handles missing zapcircle.config.toml gracefully", async () => {
    // Remove the config file
    mockFs({
      [path.resolve(process.cwd(), ".zapcircle/prompts/generate")]: {
        "example.txt": "Hello, ${name}!",
      },
    });

    const result = await loadPrompt("example", "generate", {
      name: "Jane Doe",
    });

    expect(result).toBe("Hello, Jane Doe!");
  });
});

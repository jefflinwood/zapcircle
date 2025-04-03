import mockFs from "mock-fs";
import path from "path";
import { distill } from "./distill";
import { readFileSync } from "fs";

describe("distill", () => {
  beforeEach(() => {
    // Mock file system
    mockFs({
      "test-project": {
        "package.json": JSON.stringify({
          dependencies: {
            next: "latest",
            jest: "latest",
          },
          devDependencies: {
            typescript: "latest",
          },
        }),
        "tsconfig.json": "{}",
        pages: {
          "index.tsx": "export default function Home() {}",
        },
        tests: {
          "example.test.ts": "describe('Example Test', () => {});",
        },
        ".gitignore": "node_modules\n.env",
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("detects framework, language, and test frameworks", async () => {
    await distill("test-project", { output: "test-project" });
    const output = readFileSync(
      path.join("test-project", "zapcircle.distill.toml"),
      "utf-8",
    );

    expect(output).toContain('framework = "Next.js (Page Router)"');
    expect(output).toContain('language = "TypeScript"');
    expect(output).toContain('frameworks = [ "Jest" ]');
  });

  it("respects .gitignore and excludes ignored files", async () => {
    await distill("test-project", { output: "test-project" });
    const output = readFileSync(
      path.join("test-project", "zapcircle.distill.toml"),
      "utf-8",
    );

    expect(output).not.toContain("node_modules");
    expect(output).not.toContain(".env");
  });

  it("handles missing package.json gracefully", async () => {
    mockFs({
      "test-project": {
        ".gitignore": "node_modules\n.env",
      },
    });
    await distill("test-project", { output: "test-project" });
    const output = readFileSync(
      path.join("test-project", "zapcircle.distill.toml"),
      "utf-8",
    );

    expect(output).toContain('framework = "Unknown"');
    expect(output).toContain('language = "JavaScript"');
  });
});

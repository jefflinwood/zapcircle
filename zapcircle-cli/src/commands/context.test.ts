import mockFs from "mock-fs";
import path from "path";
import { context } from "./context";
import { readFileSync } from "fs";

describe("context", () => {
  beforeEach(() => {
    // Mock file system
    mockFs({
      "test-project": {
        "package.json": JSON.stringify({
          dependencies: {
            "next": "latest",
            "jest": "latest"
          },
          devDependencies: {
            "typescript": "latest"
          }
        }),
        "tsconfig.json": "{}",
        "pages": {
          "index.tsx": "export default function Home() {}"
        },
        "tests": {
          "example.test.ts": "describe('Example Test', () => {});"
        },
        ".gitignore": "node_modules\n.env"
      }
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("creates a consolidated context file with source code", async () => {
    await context("test-project", { output: "test-project" });

    const output = readFileSync(
      path.join("test-project", "zapcircle.context.txt"),
      "utf-8"
    );

    expect(output).toContain("=== package.json ===");
    expect(output).toContain("=== pages/index.tsx ===");
    expect(output).toContain("export default function Home() {}");
    expect(output).toContain("=== tests/example.test.ts ===");
  });

  it("respects .gitignore and excludes ignored files", async () => {
    await context("test-project", { output: "test-project" });

    const output = readFileSync(
      path.join("test-project", "zapcircle.context.txt"),
      "utf-8"
    );

    expect(output).not.toContain("node_modules");
    expect(output).not.toContain(".env");
  });

  it("handles projects with missing package.json gracefully", async () => {
    mockFs({
      "test-project": {
        "pages": {
          "index.tsx": "export default function Home() {}"
        },
        ".gitignore": "node_modules\n.env"
      }
    });

    await context("test-project", { output: "test-project" });

    const output = readFileSync(
      path.join("test-project", "zapcircle.context.txt"),
      "utf-8"
    );

    expect(output).toContain("=== pages/index.tsx ===");
    expect(output).toContain("export default function Home() {}");
  });

  it("estimates token usage for LLM context", async () => {
    console.log = jest.fn(); // Mock console.log

    await context("test-project", { output: "test-project" });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Estimated token count: \d+/)
    );
  });
});
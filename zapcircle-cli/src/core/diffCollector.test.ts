import mockFs from "mock-fs";
import path from "path";
import { getSmartChunksForReview } from "./diffCollector";
import { execSync } from "child_process";

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

describe("getSmartChunksForReview", () => {
  const testFilePath = path.resolve("/repo/src/testFile.ts");

  afterEach(() => {
    mockFs.restore();
    jest.clearAllMocks();
  });

  it("returns a chunked annotated file around a single changed line", () => {
    // Mock the file content
    const content = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join(
      "\n",
    );
    mockFs({
      "/repo/src/testFile.ts": content,
    });

    // Mock the diff output (change at line 18)
    (execSync as jest.Mock).mockReturnValue(
      Buffer.from(`
diff --git a/testFile.ts b/testFile.ts
@@ -17,0 +18,1 @@
+console.log("New line");
    `),
    );

    const result = getSmartChunksForReview(testFilePath);

    expect(result).toContain("  13 |");
    expect(result).toContain("  18 | 👉");
    expect(result).toContain("  23 |");
    expect(result).toContain("src/testFile.ts");
  });

  it("handles changes near the start of the file", () => {
    const content = ["first", "second", "third", "fourth", "fifth"].join("\n");
    mockFs({
      "/repo/src/testFile.ts": content,
    });

    (execSync as jest.Mock).mockReturnValue(
      Buffer.from(`
diff --git a/testFile.ts b/testFile.ts
@@ -0,0 +1,1 @@
+first
    `),
    );

    const result = getSmartChunksForReview(testFilePath);
    expect(result).toContain("  1 | 👉 first");
    expect(result).not.toContain("  0 |");
  });

  it("handles multiple non-contiguous changes", () => {
    const content = Array.from({ length: 110 }, (_, i) => `line ${i + 1}`).join(
      "\n",
    );
    mockFs({
      "/repo/src/testFile.ts": content,
    });

    (execSync as jest.Mock).mockReturnValue(
      Buffer.from(`
diff --git a/testFile.ts b/testFile.ts
@@ -4,0 +5,1 @@
+let x = 1;
@@ -104,0 +105,1 @@
+let y = 2;
    `),
    );

    const result = getSmartChunksForReview(testFilePath);
    expect(result).toContain("  5 | 👉");
    expect(result).toContain("105 | 👉");
    expect(result).toContain("...snip...");
  });

  it("returns an empty string if file read fails", () => {
    mockFs({});
    (execSync as jest.Mock).mockReturnValue(Buffer.from(""));

    const result = getSmartChunksForReview(testFilePath);
    expect(result).toBe("");
  });

  it("returns an empty string if git diff fails", () => {
    const content = "console.log('hi');\n";
    mockFs({
      "/repo/src/testFile.ts": content,
    });

    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error("git diff failed");
    });

    const result = getSmartChunksForReview(testFilePath);
    expect(result).toBe("");
  });
});

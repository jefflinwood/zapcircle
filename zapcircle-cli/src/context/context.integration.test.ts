import { buildContextForComponent } from "./index";
import path from "path";

describe("Context Integration Test", () => {
  it("builds a complete and pruned context for a React component with behavior", async () => {
    const entryFile = path.resolve(__dirname, "fixtures/LoginForm.jsx");
    const behaviorFile = path.resolve(__dirname, "fixtures/LoginForm.zap.toml");

    const context = await buildContextForComponent(entryFile, behaviorFile, {
      maxFiles: 5,
      maxTokensPerFile: 1000,
      includeBehavior: true,
    });

    // Basic file inclusion check
    expect(context.entryFile).toBe(entryFile);
    expect(Object.keys(context.files)).toContain(entryFile);

    // Should include related files (e.g., Button, hooks)
    expect(
      Object.keys(context.files).some(f => f.includes("Button.jsx"))
    ).toBe(true);
    expect(
        Object.keys(context.files).some(f => f.includes("useAuth.js"))
      ).toBe(true);

    // Behavior should be included
    expect(context.behaviorFile).toContain("LoginForm");

    // Shared state files (e.g., authState.js)
    expect(context.stateFiles).toBeDefined();
    expect(
      Object.keys(context.stateFiles!).some(f => f.includes("authState"))
    ).toBe(true);

    // Files should be pruned below token limit
    Object.values(context.files).forEach(fileContent => {
      const tokenEstimate = fileContent.split(/\s+/).length; // crude token proxy
      expect(tokenEstimate).toBeLessThanOrEqual(1000);
    });
  });
});
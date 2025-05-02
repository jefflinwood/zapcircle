// generateAllComponents.ts
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { readdirSync } from "fs";
import { invokeLLMWithSpinner } from "../../commandline/invokeLLMWithSpinner";
import { loadPrompt } from "../../core/promptLoader";

export async function generateAllComponents(
  projectType: string,
  projectDir: string,
  options: { verbose?: boolean; interactive?: boolean } = {},
) {
  const isVerbose = options.verbose || false;
  const componentsDir = path.join(projectDir, "src");
  const projectTomlPath = path.join(projectDir, "project.zap.toml");
  const projectToml = readFileSync(projectTomlPath, "utf-8");

  const behaviorFiles = readdirSync(componentsDir).filter((f) =>
    f.endsWith(".zap.toml"),
  );
  let behaviorContext = "";

  for (const file of behaviorFiles) {
    const behavior = readFileSync(
      path.join(componentsDir, file),
      "utf-8",
    ).trim();
    behaviorContext += `=== ${file} ===\n${behavior}\n\n`;
  }

  const prompt = await loadPrompt(projectType, "components", {
    projectToml: projectToml,
    behaviorContext: behaviorContext,
  });

  const result = await invokeLLMWithSpinner(prompt, isVerbose);

  const blocks = result.match(/=== (.*?) ===\n([\s\S]*?)(?=(\n===|$))/g);
  if (blocks) {
    for (const block of blocks) {
      const match = block.match(/=== (.*?) ===\n([\s\S]*)/);
      if (match) {
        const filename = match[1].trim();
        let code = match[2].trim();
        code = code
          .replace(/^```(tsx|typescript)?/gm, "")
          .replace(/```$/gm, "")
          .trim();

        const outputPath = path.join(componentsDir, filename);

        writeFileSync(outputPath, code);
        console.log(`🧩 Wrote ${filename}`);
      }
    }
    console.log("✅ All components and App.tsx generated successfully.");
  } else {
    console.error("❌ Failed to parse output. No files were generated.");
  }
}

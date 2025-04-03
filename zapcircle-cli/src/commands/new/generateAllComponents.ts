// generateAllComponents.ts
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { readdirSync } from "fs";
import { invokeLLMWithSpinner } from "../../commandline/invokeLLMWithSpinner";

export async function generateAllComponents(
  projectDir: string,
  options: { verbose?: boolean; interactive?: boolean } = {}
) {
  const isVerbose = options.verbose || false;
  const componentsDir = path.join(projectDir, "src", "components");
  const projectTomlPath = path.join(projectDir, "project.zap.toml");
  const projectToml = readFileSync(projectTomlPath, "utf-8");

  const behaviorFiles = readdirSync(componentsDir).filter(f => f.endsWith(".zap.toml"));
  let behaviorContext = "";

  for (const file of behaviorFiles) {
    const behavior = readFileSync(path.join(componentsDir, file), "utf-8").trim();
    behaviorContext += `=== ${file} ===\n${behavior}\n\n`;
  }

  const prompt = `You are a senior React developer. Given the project.zap.toml file and the following component behaviors, generate the complete set of React component files for this application.

You must:
- Include one top-level App.tsx
- Generate one file for each component
- Ensure that props and shared state are used consistently
- Include only valid TypeScript React code, using function components
- Use Tailwind CSS classes where layout is relevant
- Do not include markdown, commentary, or explanations

Format your output using:
=== App.tsx ===
<code>

=== ComponentName.tsx ===
<code>

project.zap.toml:
"""
${projectToml}
"""

Component behaviors:
${behaviorContext}`;

  const result = await invokeLLMWithSpinner(prompt, isVerbose);

  const blocks = result.match(/=== (.*?) ===\n([\s\S]*?)(?=(\n===|$))/g);
  if (blocks) {
    for (const block of blocks) {
      const match = block.match(/=== (.*?) ===\n([\s\S]*)/);
      if (match) {
        const filename = match[1].trim();
        let code = match[2].trim();
        code = code.replace(/^```(tsx|typescript)?/gm, "").replace(/```$/gm, "").trim();

        const outputPath =
          filename === "App.tsx"
            ? path.join(projectDir, "src", filename)
            : path.join(componentsDir, filename);

        writeFileSync(outputPath, code);
        console.log(`🧩 Wrote ${filename}`);
      }
    }
    console.log("✅ All components and App.tsx generated successfully.");
  } else {
    console.error("❌ Failed to parse output. No files were generated.");
  }
}

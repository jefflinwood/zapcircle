// validate.ts
import path from "path";
import { execSync } from "child_process";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { loadPrompt } from "../core/promptLoader";

export async function zapcircleValidate(
  projectType: string,
  projectDir: string,
  options: { analyze?: boolean; verbose?: boolean; autofix?: boolean } = {},
) {
  const isVerbose = options.verbose || false;
  const runLLM = options.analyze !== false;
  const doAutofix = options.autofix === true;

  const srcDir = path.join(projectDir, "src");

  console.log("🧪 Running TypeScript check...");
  try {
    execSync("npx tsc --noEmit", {
      cwd: projectDir,
      stdio: "inherit",
    });
    console.log("✅ TypeScript check passed with no compile-time errors.");
  } catch (error) {
    console.error("❌ TypeScript errors were found.");
  }

  if (!runLLM) return;

  console.log("🔍 Sending source code to LLM for validation...");

  const componentFiles = readdirSync(srcDir).filter((f) => f.endsWith(".tsx"));

  let fullContext = "";

  for (const file of componentFiles) {
    const fullPath = path.join(srcDir, file);
    const content = readFileSync(fullPath, "utf-8");
    fullContext += `=== ${file} ===\n${content.trim()}\n\n`;
  }

  const prompt = await loadPrompt(projectType, "validate", {
    fullContext: fullContext,
  });

  const result = await invokeLLMWithSpinner(prompt, isVerbose);

  console.log("\LLM Validation Complete.\n");

  if (doAutofix) {
    const codeBlocks = result.match(/=== (.*?) ===\n([\s\S]*?)(?=\n===|$)/g);
    if (codeBlocks) {
      for (const block of codeBlocks) {
        const match = block.match(/=== (.*?) ===\n([\s\S]*)/);
        if (match) {
          const fileName = match[1].trim();
          let newCode = match[2].trim();

          // Strip markdown formatting and comments from LLM response
          newCode = newCode
            .replace(/^```(tsx|typescript)?/gm, "")
            .replace(/```$/gm, "")
            .trim();

          const filePath = path.join(srcDir, fileName);
          writeFileSync(filePath, newCode);
          console.log(`🛠️  Auto-fixed ${fileName}`);
        }
      }
      console.log("✅ One round of LLM-based auto-fixes applied.");
    } else {
      console.log("✅ No fixes returned. Project looks good.");
    }
  }
}

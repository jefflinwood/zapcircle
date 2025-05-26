// Suggested rewrite of `zapcircleNew` with:
// - Asking the user for the idea and project type before anything else
// - Progress messages to guide the user
// - Project type selection fallback

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { scaffoldBehaviorsFromProject } from "./new/scaffoldBehaviors";
import { zapcircleValidate } from "./validate";
import { generateAllComponents } from "./new/generateAllComponents";
import { loadPrompt } from "../core/promptLoader";
import { deduplicateComponentsInToml } from "../utils/deduplicateComponentsInToml";
import { createBaseProjectWithVite } from "./new/createBaseProjectWithVite";

export async function zapcircleNew(
  initialProjectType: string,
  projectDir: string = ".",
  ideaPrompt?: string,
  options: { interactive?: boolean; output?: string; verbose?: boolean } = {},
) {
  const outputDir = path.resolve(projectDir);
  const projectTomlPath = path.join(outputDir, "project.zap.toml");
  const isVerbose = options.verbose || false;
  const isInteractive = options.interactive || false;

  const readline = await import("readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt for idea and project type
  console.log("💡 Let's define your new project");
  if (!ideaPrompt) {
    ideaPrompt = await rl.question("What are you building? ");
  }

  let projectType = initialProjectType;
  if (!projectType) {
    projectType = await rl.question(
      "What type of project? (default: react-tsx): ",
    );
    if (!projectType.trim()) projectType = "react-tsx";
  }

  rl.close();

  // Step 1: Create base project if needed
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("🔧 Setting up base project...");
    await createBaseProjectWithVite(projectDir, isVerbose);
  } else if (isVerbose) {
    console.log("📦 Existing project detected — skipping base setup.");
  }

  // Step 2: Generate project.zap.toml
  let tomlContents = "";
  if (existsSync(projectTomlPath)) {
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const useExisting = await rl2.question(
      `A project.zap.toml file already exists. Use it? (Y/n): `,
    );
    rl2.close();
    if (useExisting.trim().toLowerCase() === "n") {
      const prompt = await loadPrompt(projectType, "new", { ideaPrompt });
      let rawToml = await invokeLLMWithSpinner(prompt, isVerbose);
      rawToml = deduplicateComponentsInToml(rawToml);
      writeFileSync(projectTomlPath, rawToml);
      console.log(`📄 Overwrote ${projectTomlPath}`);
    } else {
      tomlContents = readFileSync(projectTomlPath, "utf-8");
      console.log(`📄 Using existing ${projectTomlPath}`);
    }
  } else {
    const prompt = await loadPrompt(projectType, "new", { ideaPrompt });
    tomlContents = await invokeLLMWithSpinner(prompt, isVerbose);
    writeFileSync(projectTomlPath, tomlContents);
    console.log(`📄 Created ${projectTomlPath}`);
  }

  // Step 3: Validate TOML
  let parsedProject;
  try {
    const tomlRaw = readFileSync(projectTomlPath, "utf-8");
    parsedProject = toml.parse(tomlRaw);
  } catch (err: any) {
    console.error("❌ Error: project.zap.toml is not valid TOML.");
    console.error(err.message || err);
    process.exit(1);
  }

  // Step 4: Ensure src directory exists
  const srcDir = path.join(outputDir, "src");
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    console.log("📁 Created src directory");
  }

  // Step 5: Scaffold behavior files
  console.log("🔍 Scaffolding behaviors...");
  await scaffoldBehaviorsFromProject(projectTomlPath, {
    output: srcDir,
    interactive: isInteractive,
  });

  // Step 6: Generate components
  console.log("⚙️ Generating components...");
  await generateAllComponents(projectType, outputDir, { verbose: isVerbose });

  // Step 7: Validate generated project
  console.log("✅ Validating project...");
  await zapcircleValidate(projectType, outputDir, {
    verbose: isVerbose,
    autofix: true,
  });

  console.log("🎉 Project scaffolding complete!");
  console.log("👉 Run it with: npm run dev");
}

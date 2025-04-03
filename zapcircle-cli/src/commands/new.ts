import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { scaffoldBehaviorsFromProject } from "./new/scaffoldBehaviors";
import { zapcircleValidate } from "./validate";
import { generateAllComponents } from "./new/generateAllComponents";
import { loadPrompt } from "../core/promptLoader";

export async function zapcircleNew(
  projectType: string,
  projectDir: string = ".",
  ideaPrompt?: string,
  options: { interactive?: boolean; output?: string; verbose?: boolean } = {}
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

  let tomlContents = "";

  if (existsSync(projectTomlPath)) {
    const useExisting = await rl.question(
      `A project.zap.toml file already exists. Use it? (Y/n): `
    );
    if (useExisting.trim().toLowerCase() === "n") {
      if (!ideaPrompt) {
        ideaPrompt = await rl.question("What are you building? ");
      }
      const prompt = await loadPrompt(projectType, "new", {ideaPrompt: ideaPrompt});

      tomlContents = await invokeLLMWithSpinner(prompt, isVerbose);
      writeFileSync(projectTomlPath, tomlContents);
      console.log(`📄 Overwrote ${projectTomlPath}`);
    } else {
      tomlContents = readFileSync(projectTomlPath, "utf-8");
      console.log(`📄 Using existing ${projectTomlPath}`);
    }
  } else {
    if (!ideaPrompt) {
      ideaPrompt = await rl.question("What are you building? ");
    }

    const prompt = await loadPrompt(projectType, "new", {ideaPrompt: ideaPrompt});

    tomlContents = await invokeLLMWithSpinner(prompt, isVerbose);
    writeFileSync(projectTomlPath, tomlContents);
    console.log(`📄 Created ${projectTomlPath}`);
  }

  rl.close();

  // Ensure src/components directory exists
  const componentsDir = path.join(outputDir, "src", "components");
  if (!existsSync(componentsDir)) {
    mkdirSync(componentsDir, { recursive: true });
    console.log("📁 Created src/components directory");
  }

  // Step 2: Scaffold behavior files from project.zap.toml
  await scaffoldBehaviorsFromProject(projectTomlPath, {
    output: componentsDir,
    interactive: isInteractive,
  });

  // Step 3: One-shot generation of all components
  await generateAllComponents(projectType, outputDir, { verbose: isVerbose });

  // Step 4: Validate the generated project
  await zapcircleValidate(projectType, outputDir, { verbose: isVerbose, autofix: true });

  console.log("✅ Project scaffolding complete!");
  console.log("👉 You can now run your app or customize App.tsx and the components.");
}

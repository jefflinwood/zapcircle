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
  projectType: string,
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

  let tomlContents = "";

  const packageJsonPath = path.join(projectDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    await createBaseProjectWithVite(projectDir, isVerbose);
  } else if (isVerbose) {
    console.log(
      "📦 Existing project detected (package.json found) — skipping base Vite setup.",
    );
  }

  if (existsSync(projectTomlPath)) {
    const useExisting = await rl.question(
      `A project.zap.toml file already exists. Use it? (Y/n): `,
    );
    if (useExisting.trim().toLowerCase() === "n") {
      if (!ideaPrompt) {
        ideaPrompt = await rl.question("What are you building? ");
      }
      const prompt = await loadPrompt(projectType, "new", {
        ideaPrompt: ideaPrompt,
      });

      let rawToml = await invokeLLMWithSpinner(prompt, isVerbose);
      rawToml = deduplicateComponentsInToml(rawToml);
      writeFileSync(projectTomlPath, rawToml);
      console.log(`📄 Overwrote ${projectTomlPath}`);
    } else {
      tomlContents = readFileSync(projectTomlPath, "utf-8");
      console.log(`📄 Using existing ${projectTomlPath}`);
    }
  } else {
    if (!ideaPrompt) {
      ideaPrompt = await rl.question("What are you building? ");
    }

    const prompt = await loadPrompt(projectType, "new", {
      ideaPrompt: ideaPrompt,
    });

    tomlContents = await invokeLLMWithSpinner(prompt, isVerbose);
    writeFileSync(projectTomlPath, tomlContents);
    console.log(`📄 Created ${projectTomlPath}`);
  }

  rl.close();

  // Ensure src directory exists
  const srcDir = path.join(outputDir, "src");
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    console.log("📁 Created src directory");
  }

  // Validate TOML before moving forward
  let parsedProject;
  try {
    const tomlRaw = readFileSync(projectTomlPath, "utf-8");
    parsedProject = toml.parse(tomlRaw);
  } catch (err: any) {
    console.error("❌ Error: project.zap.toml is not valid TOML.");
    console.error(err.message || err);
    process.exit(1); // abort early
  }

  // Step 2: Scaffold behavior files from project.zap.toml
  await scaffoldBehaviorsFromProject(projectTomlPath, {
    output: srcDir,
    interactive: isInteractive,
  });

  // Step 3: One-shot generation of all components
  await generateAllComponents(projectType, outputDir, { verbose: isVerbose });

  // Step 4: Validate the generated project
  await zapcircleValidate(projectType, outputDir, {
    verbose: isVerbose,
    autofix: true,
  });

  console.log("✅ Project scaffolding complete!");
  console.log(
    "You can now run your app or customize App.tsx and the components.",
  );
}

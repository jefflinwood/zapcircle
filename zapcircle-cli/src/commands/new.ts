// zapcircle-new.ts
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { scaffoldBehaviorsFromProject } from "./new/scaffoldBehaviors";
import { generateComponent } from "./generate";
import { writeOutputFile } from "../utils/writeOutputFile";

export async function zapcircleNew(
  projectDir: string,
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

      const prompt = `You are a behavior-driven development assistant. Given the project idea below, generate a project.zap.toml file.

The TOML should contain:
- name and description
- a [state] section if there is shared state
- a [layout] section if layout is relevant
- a [components] section, where each component includes a name, role, and behavior.

Project idea:
"""
${ideaPrompt}
"""

Respond ONLY with the contents of project.zap.toml, with no markdown, comments, or other extraneous language.`;

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

    const prompt = `You are a behavior-driven development assistant. Given the project idea below, generate a project.zap.toml file.

The TOML should contain:
- name and description
- a [state] section if there is shared state
- a [layout] section if layout is relevant
- a [components] section, where each component includes a name, role, and behavior.

Project idea:
"""
${ideaPrompt}
"""

Respond ONLY with the contents of project.zap.toml, with no markdown, comments, or other extraneous language.`;

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

  // Step 3: Generate component files from behaviors
  const fs = await import("fs");
  const behaviorFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".zap.toml"));
  for (const file of behaviorFiles) {
    const fullPath = path.join(componentsDir, file);
    await generateComponent("tsx", fullPath, {
      output: componentsDir,
      interactive: isInteractive,
      verbose: isVerbose,
    });
  }

  console.log("✅ Project scaffolding complete!");
  console.log("👉 You can now edit App.tsx to wire your components together.");
}

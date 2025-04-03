// zapcircle-new.ts
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { scaffoldBehaviorsFromProject } from "./new/scaffoldBehaviors";
import { zapcircleValidate } from "./validate";
import { generateAllComponents } from "./new/generateAllComponents";

const generationInstructions = `You are a behavior-driven development assistant. Given the following app idea, generate a project.zap.toml file that can be used to scaffold a React + Tailwind project with component behaviors, state, and layout.

The TOML should contain:
- name and description
- [layout]: structure, framework, and cssFramework
- [state]: shared state variable names, types, and descriptions
- [components]: each component should have:
  - a unique name
  - a role (what it does)
  - a list of inputs (props it receives)
  - a behavior (how it behaves and why)
  - if applicable, state it manages or provides
- [data]: for any hard-coded or mock data (including shape and fields)
- [interaction]: how state flows, how props are passed, if context is used
- [build]: where generated components should go (e.g. "./src/components")
- [design]: overall user interface theme, primaryColor, secondaryColor, and fontFamily, if the user has a visual style preference

Respond ONLY with the contents of project.zap.toml, without markdown formatting or commentary.`;

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

      const prompt = `${generationInstructions}

App idea:
"""
${ideaPrompt}
"""`;

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

    const prompt = `${generationInstructions}

App idea:
"""
${ideaPrompt}
"""`;

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

  // Step 3: One-shot generation of all components + App.tsx
  await generateAllComponents(outputDir, { verbose: isVerbose });

  // Step 4: Validate the generated project
  await zapcircleValidate(outputDir, { verbose: isVerbose, autofix: true });

  console.log("✅ Project scaffolding complete!");
  console.log("👉 You can now run your app or customize App.tsx and the components.");
}

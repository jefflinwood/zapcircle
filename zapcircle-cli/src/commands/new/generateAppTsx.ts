import { readFileSync, writeFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { invokeLLMWithSpinner } from "../../commandline/invokeLLMWithSpinner";

export async function generateAppTsx(
  projectTomlPath: string,
  outputDir: string,
  options: { verbose?: boolean } = {}
) {
  const isVerbose = options.verbose || false;
  const appPath = path.join(outputDir, "src", "App.tsx");

  const tomlContents = readFileSync(projectTomlPath, "utf-8");
  const parsedToml = toml.parse(tomlContents);

  const prompt = `You are a TypeScript React developer. Based on the following project.zap.toml, generate a complete App.tsx file.


  This file should:
  - Import the generated components from ./components/
  - Define any shared state if mentioned
  - Pass props between components correctly
  - Include some mock or hard-coded data if necessary
  - Use Tailwind CSS for layout if layout is specified
  - Ensure that all prop names and types match the expected inputs of each component
  - Ensure the state variable names used in App.tsx match those defined in [state]
  - Do not rename any prop or state keys inconsistently
  - Do not include unused imports or components

Respond ONLY with valid TypeScript code. Do not include markdown, explanations, or other extraneous information.

project.zap.toml:
"""
${tomlContents}
"""`;

  const appCode = await invokeLLMWithSpinner(prompt, isVerbose);
  writeFileSync(appPath, appCode);

  console.log(`📄 Created ${appPath}`);
}
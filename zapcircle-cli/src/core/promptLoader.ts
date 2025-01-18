import fs from "fs-extra";
import path from "path";

export async function loadPrompt(promptName: string, promptType: string, variables: Record<string, string>): Promise<string> {
  const defaultPromptPath = path.resolve(__dirname, "../prompts", promptType, `${promptName}.txt`);
  const projectPromptPath = path.resolve(process.cwd(), ".zapcircle/prompts", promptType, `${promptName}.txt`);

  let template: string;

  // Load project-specific prompt if it exists
  if (await fs.pathExists(projectPromptPath)) {
    template = await fs.readFile(projectPromptPath, "utf-8");
  } else if (await fs.pathExists(defaultPromptPath)) {
    template = await fs.readFile(defaultPromptPath, "utf-8");
  } else {
    throw new Error(`Prompt template not found: ${promptName}`);
  }

  // Interpolate variables
  return interpolateTemplate(template, variables);
}

function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\$\{(.*?)\}/g, (_, key) => {
    return variables[key] || "";
  });
}
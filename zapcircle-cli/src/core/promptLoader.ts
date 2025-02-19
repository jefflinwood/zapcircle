import fs from "fs-extra";
import path from "path";
import toml from "@iarna/toml";

// Define the structure of zapcircle.config.toml
interface PromptConfig {
  all?: string;
  analyze?: string;
  generate?: string;
}

interface ZapCircleConfig {
  prompts?: PromptConfig;
}

export async function loadPrompt(
  promptName: string,
  promptType: string,
  variables: Record<string, string>
): Promise<string> {
  // Load project-wide configurations from zapcircle.config.toml
  const configVariables = await loadProjectConfig();

  // Merge config variables into the provided variables
  const mergedVariables = { ...configVariables, ...variables };

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
  return interpolateTemplate(template, mergedVariables);
}

function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\$\{(.*?)\}/g, (_, key) => {
    return variables[key] || "";
  });
}

async function loadProjectConfig(): Promise<Record<string, string>> {
  let dir = process.cwd();
  let configPath: string | null = null;

  // Traverse up the directory tree to find zapcircle.config.toml
  while (dir !== path.parse(dir).root) {
    const possiblePath = path.join(dir, "zapcircle.config.toml");
    if (await fs.pathExists(possiblePath)) {
      configPath = possiblePath;
      break;
    }
    dir = path.dirname(dir);
  }

  if (!configPath) {
    return {}; // No config found, return empty object
  }

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const parsedConfig: ZapCircleConfig = toml.parse(configContent) as ZapCircleConfig;

    // Extract and flatten relevant configurations into a single key-value mapping
    const extractedVariables: Record<string, string> = {};

    if (parsedConfig.prompts) {
      if (parsedConfig.prompts.all) {
        extractedVariables["global_prompt"] = parsedConfig.prompts.all.trim();
      }
      if (parsedConfig.prompts.analyze) {
        extractedVariables["analyze_prompt"] = parsedConfig.prompts.analyze.trim();
      }
      if (parsedConfig.prompts.generate) {
        extractedVariables["generate_prompt"] = parsedConfig.prompts.generate.trim();
      }
    }

    return extractedVariables;
  } catch (error) {
    console.error("Error reading zapcircle.config.toml:", error);
    return {};
  }
}
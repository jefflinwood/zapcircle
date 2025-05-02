import * as path from "path";
import { loadUserConfig } from "../core/config";
import { UserConfig } from "../types/config";
import {
  createDirectory,
  createReadlineInterface,
  getHomeDir,
  pathExists,
  writeFile,
} from "../utils/platformUtils";

export const configureZapCircle = async () => {
  const rl = createReadlineInterface();

  const askQuestion = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const userConfigDir = path.join(getHomeDir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");

  if (!pathExists(userConfigDir)) {
    createDirectory(userConfigDir);
  }

  const existingConfig: UserConfig = loadUserConfig();

  console.log("🛠️ Configuring ZapCircle CLI...\n");

  const provider =
    (await askQuestion(
      `Preferred Provider (${existingConfig.provider || "openai"}): `,
    )) ||
    existingConfig.provider ||
    "openai";

  const openaiKey =
    (await askQuestion(
      `OpenAI API key (${existingConfig.openai?.apiKey ? "already set" : "optional"}): `,
    )) ||
    existingConfig.openai?.apiKey ||
    "";

  const openaiLarge =
    (await askQuestion(
      `OpenAI large model (${existingConfig.openai?.large || "gpt-4.1"}): `,
    )) ||
    existingConfig.openai?.large ||
    "gpt-4o";

  const openaiSmall =
    (await askQuestion(
      `OpenAI small model (${existingConfig.openai?.small || "o4-mini"}): `,
    )) ||
    existingConfig.openai?.small ||
    "gpt-4o-mini";

  const anthropicKey =
    (await askQuestion(
      `Anthropic API key (${existingConfig.anthropic?.apiKey ? "already set" : "optional"}): `,
    )) ||
    existingConfig.anthropic?.apiKey ||
    "";

  const anthropicLarge =
    (await askQuestion(
      `Anthropic large model (${existingConfig.anthropic?.large || "claude-3-7-sonnet-latest"}): `,
    )) ||
    existingConfig.anthropic?.large ||
    "claude-3";

  const anthropicSmall =
    (await askQuestion(
      `Anthropic small model (${existingConfig.anthropic?.small || "claude-3-5-haiku-latest"}): `,
    )) ||
    existingConfig.anthropic?.small ||
    "claude-3-haiku";

  const googleKey =
    (await askQuestion(
      `Google API key (${existingConfig.google?.apiKey ? "already set" : "optional"}): `,
    )) ||
    existingConfig.google?.apiKey ||
    "";

  const googleLarge =
    (await askQuestion(
      `Google large model (${existingConfig.google?.large || "gemini-2.0-flash"}): `,
    )) ||
    existingConfig.google?.large ||
    "gemini-2.0";

  const googleSmall =
    (await askQuestion(
      `Google small model (${existingConfig.google?.small || "gemini-2.0-flash"}): `,
    )) ||
    existingConfig.google?.small ||
    "gemini-2.0-flash";

  const localBaseUrl =
    (await askQuestion(
      `Local LLM base URL (${existingConfig.local?.baseUrl || "none"}): `,
    )) ||
    existingConfig.local?.baseUrl ||
    "";

  const isValidURL = (url: string) =>
    /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/.test(url);
  if (localBaseUrl && !isValidURL(localBaseUrl)) {
    console.warn(
      "⚠️  Warning: Local LLM base URL does not appear to be valid.",
    );
  }

  rl.close();

  const configLines = [
    `# ZapCircle CLI Configuration`,
    `provider = "${provider}"`,
    ``,
  ];

  if (openaiKey) {
    configLines.push(
      `[openai]`,
      `apiKey = "${openaiKey}"`,
      `large = "${openaiLarge}"`,
      `small = "${openaiSmall}"`,
      ``,
    );
  }

  if (anthropicKey) {
    configLines.push(
      `[anthropic]`,
      `apiKey = "${anthropicKey}"`,
      `large = "${anthropicLarge}"`,
      `small = "${anthropicSmall}"`,
      ``,
    );
  }

  if (googleKey) {
    configLines.push(
      `[google]`,
      `apiKey = "${googleKey}"`,
      `large = "${googleLarge}"`,
      `small = "${googleSmall}"`,
      ``,
    );
  }

  if (localBaseUrl) {
    configLines.push(`[local]`, `baseUrl = "${localBaseUrl}"`, ``);
  }

  writeFile(userConfigPath, configLines.join("\n"));
  console.log(`✅ Configuration saved to ${userConfigPath}`);
};

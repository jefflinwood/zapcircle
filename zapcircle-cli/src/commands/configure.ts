import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { loadUserConfig } from "../core/config";
import { UserConfig } from "../types/config";

export const configureZapCircle = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const userConfigDir = path.join(require("os").homedir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");

  if (!fs.existsSync(userConfigDir)) {
    fs.mkdirSync(userConfigDir);
  }

  const existingConfig: UserConfig = loadUserConfig();

  console.log("🛠️ Configuring ZapCircle CLI...\n");

  const provider =
    (await askQuestion(
      `Preferred Provider (${existingConfig.provider || "openai"}): `,
    )) || existingConfig.provider || "openai";

  const largeModel =
    (await askQuestion(
      `Large model (${existingConfig.models?.large || "gpt-4o"}): `,
    )) || existingConfig.models?.large || "gpt-4o";

  const smallModel =
    (await askQuestion(
      `Small model (${existingConfig.models?.small || "gpt-4o-mini"}): `,
    )) || existingConfig.models?.small || "gpt-4o-mini";

  console.log("\n🔑 Enter API keys for the providers you want to use.");
  const openaiKey =
    (await askQuestion(
      `OpenAI API key (${existingConfig.openai?.apiKey ? "already set" : "optional"}): `,
    )) || existingConfig.openai?.apiKey || "";

  const anthropicKey =
    (await askQuestion(
      `Anthropic API key (${existingConfig.anthropic?.apiKey ? "already set" : "optional"}): `,
    )) || existingConfig.anthropic?.apiKey || "";

  const googleKey =
    (await askQuestion(
      `Google API key (${existingConfig.google?.apiKey ? "already set" : "optional"}): `,
    )) || existingConfig.google?.apiKey || "";

  const localBaseUrl =
    (await askQuestion(
      `Local LLM base URL (${existingConfig.local?.baseUrl || "none"}): `,
    )) || existingConfig.local?.baseUrl || "";

  // Simple validation
  const isValidURL = (url: string) =>
    /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/.test(url);

  if (localBaseUrl && !isValidURL(localBaseUrl)) {
    console.warn("⚠️  Warning: Local LLM base URL does not appear to be valid.");
  }

  rl.close();

  // Prepare final config object
  const configLines = [
    `# ZapCircle CLI Configuration`,
    `provider = "${provider}"`,
    ``,
    `[models]`,
    `large = "${largeModel}"`,
    `small = "${smallModel}"`,
    ``,
  ];

  if (openaiKey) {
    configLines.push(`[openai]`, `apiKey = "${openaiKey}"`, ``);
  }
  if (anthropicKey) {
    configLines.push(`[anthropic]`, `apiKey = "${anthropicKey}"`, ``);
  }
  if (googleKey) {
    configLines.push(`[google]`, `apiKey = "${googleKey}"`, ``);
  }
  if (localBaseUrl) {
    configLines.push(`[local]`, `baseUrl = "${localBaseUrl}"`, ``);
  }

  fs.writeFileSync(userConfigPath, configLines.join("\n"));

  console.log(`✅ Configuration saved to ${userConfigPath}`);
};
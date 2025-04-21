import * as fs from "fs";
import * as path from "path";
import * as toml from "@iarna/toml";
import { ProjectConfig, UserConfig } from "../types/config";

export const checkZapCircleStatus = () => {
  const userConfigDir = path.join(require("os").homedir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");
  const projectConfigPath = path.join(process.cwd(), "zapcircle.config.toml");

  console.log("📦 ZapCircle Configuration Status:\n");

  // Load user-level configuration
  if (fs.existsSync(userConfigPath)) {
    try {
      const userConfigData = fs.readFileSync(userConfigPath, "utf-8");
      const userConfig = toml.parse(userConfigData) as UserConfig;

      console.log("🔧 User Configuration:");
      console.log(`  Provider: ${userConfig.provider || "Not Configured"}`);
      console.log(`  Large Model: ${userConfig.models?.large || "Not Configured"}`);
      console.log(`  Small Model: ${userConfig.models?.small || "Not Configured"}`);

      console.log("  API Keys:");
      console.log(`    OpenAI: ${userConfig.openai?.apiKey ? "✅ Configured" : "❌ Not Configured"}`);
      console.log(`    Anthropic: ${userConfig.anthropic?.apiKey ? "✅ Configured" : "❌ Not Configured"}`);
      console.log(`    Google: ${userConfig.google?.apiKey ? "✅ Configured" : "❌ Not Configured"}`);

      const localUrl = userConfig.local?.baseUrl;
      const isValidURL = (url: string) =>
        /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/.test(url);

      console.log(`    Local LLM: ${
        localUrl ? (isValidURL(localUrl) ? `✅ Configured (${localUrl})` : `⚠️ Invalid URL (${localUrl})`) : "❌ Not Configured"
      }`);
    } catch (error) {
      console.error(`❌ Error reading user configuration: ${error}`);
    }
  } else {
    console.log("🔧 User Configuration: ❌ Not Found");
  }

  console.log("\n");

  // Load project-level configuration
  if (fs.existsSync(projectConfigPath)) {
    try {
      const projectConfigData = fs.readFileSync(projectConfigPath, "utf-8");
      const projectConfig = toml.parse(projectConfigData) as ProjectConfig;

      console.log("📁 Project Configuration: ✅ Found");
      console.log("  Prompt Settings:");
      console.log(`    All Prompts: ${projectConfig.prompts?.all || "Not Configured"}`);
      console.log(`    Analyze Prompts: ${projectConfig.prompts?.analyze || "Not Configured"}`);
      console.log(`    Generate Prompts: ${projectConfig.prompts?.generate || "Not Configured"}`);

      console.log("  Filetype Generate Prompts:");
      if (projectConfig["filetype.generate"]) {
        for (const [filetype, setting] of Object.entries(
          projectConfig["filetype.generate"],
        )) {
          console.log(`    ${filetype}: ${setting}`);
        }
      } else {
        console.log("    None Configured");
      }
    } catch (error) {
      console.error(`❌ Error reading project configuration: ${error}`);
    }
  } else {
    console.log("📁 Project Configuration: ❌ Not Found");
  }

  console.log("\n✅ Status check complete.");
};
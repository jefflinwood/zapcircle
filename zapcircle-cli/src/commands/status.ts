import * as path from "path";
import * as toml from "@iarna/toml";
import { ProjectConfig, UserConfig } from "../types/config";
import {
  getCurrentDir,
  getHomeDir,
  pathExists,
  readFile,
} from "../utils/platformUtils";

export const checkZapCircleStatus = () => {
  const userConfigDir = path.join(getHomeDir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");
  const projectConfigPath = path.join(getCurrentDir(), "zapcircle.config.toml");

  console.log("📦 ZapCircle Configuration Status:\n");

  // Load user-level configuration
  if (pathExists(userConfigPath)) {
    try {
      const userConfigData = readFile(userConfigPath);
      const userConfig = toml.parse(userConfigData) as UserConfig;

      const provider = userConfig.provider || "Not Configured";
      console.log("🔧 User Configuration:");
      console.log(`  Default Provider: ${provider}`);

      const providers = ["openai", "anthropic", "google", "local"];

      for (const p of providers) {
        const block = (userConfig as any)[p];
        if (!block) continue;

        console.log(`\n  [${p}]`);
        if (p === "local") {
          const url = block.baseUrl;
          const isValidURL = (url: string) =>
            /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/.test(url);

          console.log(
            `    Base URL: ${
              url
                ? isValidURL(url)
                  ? `✅ ${url}`
                  : `⚠️ Invalid URL (${url})`
                : "❌ Not Configured"
            }`,
          );
        } else {
          console.log(
            `    API Key: ${block.apiKey ? "✅ Configured" : "❌ Not Configured"}`,
          );
          console.log(`    Large Model: ${block.large || "❌ Not Configured"}`);
          console.log(`    Small Model: ${block.small || "❌ Not Configured"}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error reading user configuration: ${error}`);
    }
  } else {
    console.log("🔧 User Configuration: ❌ Not Found");
  }

  console.log("\n");

  // Load project-level configuration
  if (pathExists(projectConfigPath)) {
    try {
      const projectConfigData = readFile(projectConfigPath);
      const projectConfig = toml.parse(projectConfigData) as ProjectConfig;

      console.log("📁 Project Configuration: ✅ Found");
      console.log("  Prompt Settings:");
      console.log(
        `    All Prompts: ${projectConfig.prompts?.all || "Not Configured"}`,
      );
      console.log(
        `    Analyze Prompts: ${projectConfig.prompts?.analyze || "Not Configured"}`,
      );
      console.log(
        `    Generate Prompts: ${projectConfig.prompts?.generate || "Not Configured"}`,
      );

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

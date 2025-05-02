import * as fs from "fs";
import * as path from "path";
import * as toml from "@iarna/toml";
import { UserConfig } from "../types/config";

export function loadUserConfig(): UserConfig {
  const userConfigDir = path.join(require("os").homedir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");

  if (fs.existsSync(userConfigPath)) {
    try {
      const userConfigData = fs.readFileSync(userConfigPath, "utf-8");
      return toml.parse(userConfigData) as UserConfig;
    } catch (error) {
      console.error(`Error reading user configuration: ${error}`);
    }
  } else {
    console.warn(
      "User configuration file not found. Falling back to defaults.",
    );
  }

  return {};
}

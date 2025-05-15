import * as fs from "fs";
import * as path from "path";

export const initProject = () => {
  const projectRoot = process.cwd();
  const projectConfigPath = path.join(projectRoot, "zapcircle.config.toml");
  const zapDir = path.join(projectRoot, ".zapcircle");
  const agentIssuesDir = path.join(zapDir, "agent/issues");

  console.log("Initializing a new ZapCircle project...");

  // Check if config already exists
  if (fs.existsSync(projectConfigPath)) {
    console.error(
      "❌ A ZapCircle configuration already exists in this directory.",
    );
    return;
  }

  // Warn if accidentally running in home dir
  if (projectRoot === require("os").homedir()) {
    console.warn(
      "⚠️ You are running init in your home directory. Are you sure this is a project?",
    );
  }

  // Write default project config
  const defaultConfig = `# ZapCircle Project Configuration
[prompts]
all = ""
analyze = ""
generate = ""

[filetype.generate]
`;
  fs.writeFileSync(projectConfigPath, defaultConfig);
  console.log(`✅ Configuration file created at ${projectConfigPath}`);

  // Create .zapcircle folder and subdirs
  fs.mkdirSync(agentIssuesDir, { recursive: true });

  // Write .gitignore for logs
  const gitignorePath = path.join(zapDir, ".gitignore");
  const gitignoreContents = `# ZapCircle Agent Logs
agent/issues/
`;
  fs.writeFileSync(gitignorePath, gitignoreContents);

  console.log(`✅ Project workspace initialized in .zapcircle/`);
};

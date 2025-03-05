import * as fs from "fs";
import * as path from "path";

export const initProject = () => {
  const projectConfigPath = path.join(process.cwd(), "zapcircle.config.toml");

  console.log("Initializing a new ZapCircle project...");

  if (fs.existsSync(projectConfigPath)) {
    console.error(
      "A ZapCircle configuration already exists in this directory.",
    );
    return;
  }

  const defaultConfig = `# ZapCircle Project Configuration
[prompts]
all = ""
analyze = ""
generate = ""

[filetype.generate]
`;

  fs.writeFileSync(projectConfigPath, defaultConfig);

  console.log(
    `ZapCircle project initialized. Configuration file created at ${projectConfigPath}`,
  );
};

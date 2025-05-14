import fs from "fs";
import path from "path";
import { analyze } from "../commands/analyze";

export async function ensureBehaviorForComponent(componentPath: string) {
  const ext = path.extname(componentPath).slice(1); // e.g., "jsx"
  const dir = path.dirname(componentPath);
  const baseName = path.basename(componentPath, `.${ext}`);
  const behaviorPath = path.join(dir, `${baseName}.zap.toml`);

  const behaviorExists = fs.existsSync(behaviorPath);

  console.log(
    behaviorExists
      ? `🛠️ Updating behavior file: ${behaviorPath}`
      : `🧪 Creating new behavior file: ${behaviorPath}`
  );

  await analyze(ext, componentPath, {
    verbose: false,
    interactive: false,
    output: behaviorPath,
  });

  return behaviorPath;
}
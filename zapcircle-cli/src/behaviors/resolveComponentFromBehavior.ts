import fs from "fs";
import path from "path";

const supportedExtensions = [".jsx", ".tsx", ".js", ".ts"];

export function resolveComponentFromBehavior(behaviorPath: string): string | undefined {
  const baseName = path.basename(behaviorPath).replace(/\.zap\.toml$/, "");
  const dir = path.dirname(behaviorPath);

  for (const ext of supportedExtensions) {
    const fullPath = path.join(dir, `${baseName}${ext}`);
    if (fs.existsSync(fullPath)) return fullPath;
  }

  return undefined;
}
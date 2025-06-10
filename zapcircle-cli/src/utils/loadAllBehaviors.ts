import { readdirSync, existsSync, statSync, readFileSync } from "fs";
import path from "path";

export async function loadAllBehaviors(targetPath = process.cwd()) {
  const behaviorFiles: { filePath: string; contents: string }[] = [];
  const ignoredPaths: string[] = [path.join(targetPath, ".git")];

  const gitignorePath = path.join(targetPath, ".gitignore");
  if (existsSync(gitignorePath)) {
    const gitignoreContent = readFileSync(gitignorePath, "utf-8");
    gitignoreContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        ignoredPaths.push(path.join(targetPath, trimmed));
      }
    });
  }

  const collectFiles = (currentPath: string): string[] => {
    let fileList: string[] = [];
    const files = readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      if (ignoredPaths.some((ignoredPath) => filePath.startsWith(ignoredPath)))
        continue;

      const stats = statSync(filePath);
      if (stats.isDirectory()) {
        fileList = fileList.concat(collectFiles(filePath));
      } else if (file.endsWith(".zap.toml")) {
        fileList.push(filePath);
      }
    }

    return fileList;
  };

  const files = collectFiles(targetPath);

  return files.map((filePath) => ({
    filePath,
    contents: readFileSync(filePath, "utf-8"),
  }));
}

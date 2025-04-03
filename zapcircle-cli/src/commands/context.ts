import {
  readdirSync,
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "fs";
import path from "path";
import { encode } from "gpt-tokenizer"; // Assuming OpenAI's tokenizer is used

export async function context(
  targetPath: string,
  options: { verbose?: boolean; output?: string },
) {
  try {
    const outputDir = options.output || path.dirname(targetPath);
    const outputFilePath = path.join(outputDir, "zapcircle.context.txt");

    // Load .gitignore and parse exclusions
    const gitignorePath = path.join(targetPath, ".gitignore");
    const ignoredPaths: string[] = [];
    ignoredPaths.push(path.join(targetPath, ".git"));
    if (existsSync(gitignorePath)) {
      const gitignoreContent = readFileSync(gitignorePath, "utf-8");
      gitignoreContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          ignoredPaths.push(path.join(targetPath, trimmed));
        }
      });
    }

    // Helper function to scan directory and collect source files
    const collectFiles = (currentPath: string): string[] => {
      let fileList: string[] = [];
      const files = readdirSync(currentPath);

      for (const file of files) {
        const filePath = path.join(currentPath, file);
        if (
          ignoredPaths.some((ignoredPath) => filePath.startsWith(ignoredPath))
        )
          continue;

        const stats = statSync(filePath);

        if (stats.isDirectory()) {
          fileList = fileList.concat(collectFiles(filePath));
        } else {
          // Include only source files
          if (
            file.endsWith(".js") ||
            file.endsWith(".ts") ||
            file.endsWith(".jsx") ||
            file.endsWith(".tsx") ||
            file.endsWith(".json")
          ) {
            fileList.push(filePath);
          }
        }
      }
      return fileList;
    };

    // Collect relevant source files
    const files = collectFiles(targetPath);

    let combinedContent = "";
    let tokenCount = 0;

    files.forEach((filePath) => {
      const content = readFileSync(filePath, "utf-8");
      combinedContent += `\n\n=== ${filePath.replace(targetPath + path.sep, "")} ===\n\n${content}`;
      tokenCount += encode(content).length;
    });

    // Save the combined content to a text file
    writeFileSync(outputFilePath, combinedContent);

    console.log(`Context file created: ${outputFilePath}`);
    console.log(`Estimated token count: ${tokenCount}`);
  } catch (error) {
    console.error("Error running context:", error);
  }
}

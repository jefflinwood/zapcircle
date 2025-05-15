import { readdirSync, statSync, readFileSync, existsSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { writeOutputFile } from "../utils/writeOutputFile";

export async function analyze(
  fileType: string,
  targetPath: string,
  options: { verbose?: boolean; output?: string; interactive?: boolean },
) {
  try {
    const outputDir = options.output || path.dirname(targetPath);
    const isVerbose = options.verbose || false;
    const isInteractive = options.interactive || false;

    const processPath = async (currentPath: string) => {
      const stats = statSync(currentPath);

      if (stats.isDirectory()) {
        const files = readdirSync(currentPath);
        for (const file of files) {
          await processPath(path.join(currentPath, file));
        }
      } else if (stats.isFile() && currentPath.endsWith("." + fileType)) {
        const sourceFileContents = readFileSync(currentPath, "utf-8");
        const baseName = path.basename(currentPath, "." + fileType);
        const behaviorFilePath = path.join(outputDir, `${baseName}.zap.toml`);

        let existingBehaviorText = "";
        let existingBehaviorObject = {};

        if (existsSync(behaviorFilePath)) {
          try {
            const raw = readFileSync(behaviorFilePath, "utf-8");
            existingBehaviorObject = toml.parse(raw);
            existingBehaviorText = raw;
          } catch (err) {
            console.warn(
              `⚠️ Failed to parse existing behavior file: ${behaviorFilePath}`,
            );
          }
        }

        const prompt = await loadPrompt(fileType, "analyze", {
          name: baseName,
          sourceCode: sourceFileContents,
          existingBehavior: existingBehaviorText || "None",
        });

        const result = await invokeLLMWithSpinner(prompt, isVerbose);

        // Merge new behavior result into existingBehaviorObject
        const updatedBehavior = {
          ...existingBehaviorObject,
          name: baseName,
          behavior: result.trim(),
        };

        const tomlContents = toml.stringify(updatedBehavior);
        const outputFilePath = path.join(outputDir, `${baseName}.zap.toml`);
        writeOutputFile(outputFilePath, tomlContents, isInteractive);

        console.log(`🧠 Behavior updated: ${outputFilePath}`);
      }
    };

    await processPath(targetPath);
    console.log(`✅ Analysis completed for path: ${targetPath}`);
  } catch (error) {
    console.error("❌ Error analyzing component:", error);
  }
}

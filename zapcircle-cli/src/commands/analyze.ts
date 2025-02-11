import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";

export async function analyze(fileType: string, targetPath: string, options: { output?: string }) {
  try {
    const outputDir = options.output || path.dirname(targetPath);

    // Helper function for recursion
    const processPath = async (currentPath: string) => {
      const stats = statSync(currentPath);

      if (stats.isDirectory()) {
        // Recursively analyze files in the directory
        const files = readdirSync(currentPath);
        for (const file of files) {
          await processPath(path.join(currentPath, file));
        }
      } else if (stats.isFile() && currentPath.endsWith("." + fileType)) {
        // Analyze the source code file
        const sourceFileContents = readFileSync(currentPath, "utf-8");

        const baseName = path.basename(currentPath);

        const analysisVariables = {
          name: baseName as string,
          sourceCode: sourceFileContents as string,
        };

        const prompt = await loadPrompt(fileType, "analyze", analysisVariables);

        const result = await invokeLLMWithSpinner(prompt);

        const tomlVariables = {
            name: baseName,
            behavior: result
        }

        const tomlContents = toml.stringify(tomlVariables);

        const outputFilePath = path.join(
          outputDir, path.basename(currentPath) + ".zap.toml");

        writeFileSync(outputFilePath, tomlContents);

        console.log(`Analysis generated: ${outputFilePath}`);
      }
    };

    // Start processing from the target path
    await processPath(targetPath);

    console.log(`Analysis completed for path: ${targetPath}`);
  } catch (error) {
    console.error("Error analyzing component:", error);
  }
}
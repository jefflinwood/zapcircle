import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { writeOutputFile } from "../utils/writeOutputFile";
import { readDir, readFile, stat } from "../utils/platformUtils";

export async function analyze(
  fileType: string,
  targetPath: string,
  options: { verbose?: boolean; output?: string; interactive?: boolean },
) {
  try {
    const outputDir = options.output || path.dirname(targetPath);
    const isVerbose = options.verbose || false;
    const isInteractive = options.interactive || false;

    // Helper function for recursion
    const processPath = async (currentPath: string) => {
      const stats = stat(currentPath);

      if (stats.isDirectory()) {
        // Recursively analyze files in the directory
        const files = readDir(currentPath);
        for (const file of files) {
          await processPath(path.join(currentPath, file));
        }
      } else if (stats.isFile() && currentPath.endsWith("." + fileType)) {
        // Analyze the source code file
        const sourceFileContents = readFile(currentPath);

        const baseName = path.basename(currentPath);

        const analysisVariables = {
          name: baseName as string,
          sourceCode: sourceFileContents as string,
        };

        const prompt = await loadPrompt(fileType, "analyze", analysisVariables);

        const result = await invokeLLMWithSpinner(prompt, isVerbose);

        const tomlVariables = {
          name: baseName,
          behavior: result,
        };

        const tomlContents = toml.stringify(tomlVariables);

        const outputFilePath = path.join(
          outputDir,
          path.basename(currentPath) + ".zap.toml",
        );

        writeOutputFile(outputFilePath, tomlContents, isInteractive);

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

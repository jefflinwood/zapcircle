import { readFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { writeOutputFile } from "../utils/writeOutputFile";

export async function generateComponent(fileType: string, tomlFilePath: string, options: { interactive?: boolean; output?: string, verbose?: boolean }) {
  try {
    const tomlFileContents = readFileSync(tomlFilePath, "utf-8");
    const tomlVariables = toml.parse(tomlFileContents);

    const outputDir = options.output || path.dirname(tomlFilePath);
    const isVerbose = options.verbose || false;
    const isInteractive = options.interactive || false;

    const codeVariables = {
        name: tomlVariables['name'] as string,
        behavior: tomlVariables['behavior'] as string
    }

    const prompt = await loadPrompt(fileType, 'generate', codeVariables);

    const result = await invokeLLMWithSpinner(prompt, isVerbose);

    const outputFilePath = path.join(outputDir, `${path.basename(tomlFilePath, ".zap.toml")}`);
    writeOutputFile(outputFilePath, result, isInteractive)
    
    console.log(`Component generated: ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating component:", error);
  }
}
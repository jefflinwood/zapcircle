import { readFileSync, writeFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLM } from "../core/llmService";

export async function generateComponent(fileType: string, tomlFilePath: string, options: { overwrite?: boolean; output?: string }) {
  try {
    const tomlFileContents = readFileSync(tomlFilePath, "utf-8");
    const tomlVariables = toml.parse(tomlFileContents);

    const outputDir = options.output || path.dirname(tomlFilePath);

    const codeVariables = {
        name: tomlVariables['name'] as string,
        behavior: tomlVariables['behavior'] as string
    }

    const prompt = await loadPrompt(fileType, 'generate', codeVariables);

    const result = await invokeLLM(prompt);

    const outputFilePath = path.join(outputDir, `${path.basename(tomlFilePath, ".zap.toml")}.${fileType}`);
    writeFileSync(outputFilePath, result, { flag: options.overwrite ? "w" : "wx" });

    console.log(`Component generated: ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating component:", error);
  }
}
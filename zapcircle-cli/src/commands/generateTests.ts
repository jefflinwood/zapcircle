import { readFileSync, writeFileSync } from "fs";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";

// Mapping file extensions for test files
const testFileExtensions: Record<string, string> = {
  jsx: "js",
  tsx: "ts",
};

export async function generateTests(
  fileType: string,
  tomlFilePath: string,
  codePath: string,
  options: { framework?: string; overwrite?: boolean; output?: string, verbose?: boolean }
) {
  try {
    const tomlFileContents = readFileSync(tomlFilePath, "utf-8");
    const tomlVariables = toml.parse(tomlFileContents);

    const codeFileContents = readFileSync(codePath, "utf-8");

    const outputDir = options.output || path.dirname(tomlFilePath);
    const testFramework = options.framework || "jest"; // Default to Jest
    const isVerbose = options.verbose || false;

    const testVariables = {
      name: tomlVariables["name"] as string,
      behavior: tomlVariables["behavior"] as string,
      code: codeFileContents,
      framework: testFramework,
    };

    // Load the test generation prompt
    const prompt = await loadPrompt(fileType, "generateTests", testVariables);

    // Invoke LLM to generate test cases
    const result = await invokeLLMWithSpinner(prompt, isVerbose);

    // Determine the correct test file extension
    const extension = testFileExtensions[fileType] || fileType;
    const outputFilePath = path.join(
      outputDir,
      `${path.basename(codePath, `.${fileType}`)}.test.${extension}`
    );

    // Write test file to disk
    writeFileSync(outputFilePath, result, {
      flag: options.overwrite ? "w" : "wx",
    });

    console.log(`Test file generated: ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating test file:", error);
  }
}
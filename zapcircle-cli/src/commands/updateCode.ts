import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import toml from "@iarna/toml";
import { loadPrompt } from "../core/promptLoader";
import { invokeLLM } from "../core/llmService";

export async function updateCode(
  pathToToml: string,
  pathToCode: string,
  options: { review?: boolean; diffOnly?: boolean }
) {
  try {
    // Check if both files exist
    if (!existsSync(pathToToml)) {
      console.error(`Error: Behavior file "${pathToToml}" not found.`);
      return;
    }
    if (!existsSync(pathToCode)) {
      console.error(`Error: Component file "${pathToCode}" not found.`);
      return;
    }

    // Read and parse the .zap.toml behavior file
    const tomlFileContents = readFileSync(pathToToml, "utf-8");
    const tomlVariables = toml.parse(tomlFileContents);
    const newBehavior = tomlVariables["behavior"] as string;

    // Read the existing component code
    const existingCode = readFileSync(pathToCode, "utf-8");

    // Get Git diff of the last committed behavior file
    let previousBehavior = "";
    try {
      previousBehavior = execSync(`git show HEAD:${pathToToml}`, {
        encoding: "utf-8",
      });
    } catch (error) {
      console.warn("No previous behavior found in Git. Using current state.");
      previousBehavior = tomlFileContents; // If no previous version, assume unchanged
    }

    // Detect changes in behavior
    if (previousBehavior.trim() === newBehavior.trim()) {
      console.log("No changes detected in behavior. Skipping update.");
      return;
    }

    console.log("Detected changes in behavior. Updating component...");

    // Generate a structured prompt with the diff
    const behaviorDiff = getGitDiff(pathToToml, tomlFileContents);

    const codeVariables = {
      name: tomlVariables["name"] as string,
      behavior: newBehavior,
      existingCode: existingCode,
      behaviorDiff: behaviorDiff  || "No previous version found. Assume full replacement.",
    };

    const prompt = await loadPrompt("jsx", "update", codeVariables);

    if (options.diffOnly) {
      console.log("Diff detected:");
      console.log(behaviorDiff);
      return;
    }

    // Invoke the LLM for an intelligent update
    const updatedCode = await invokeLLM(prompt);

    // Interactive Review Mode
    if (options.review) {
      console.log("Proposed Update:");
      console.log(updatedCode);
      const userInput = await promptUser("Accept changes? (y/n): ");
      if (userInput.trim().toLowerCase() !== "y") {
        console.log("Update canceled.");
        return;
      }
    }

    // Apply the update and write back to the component file
    writeFileSync(pathToCode, updatedCode, "utf-8");

    console.log(`Component updated: ${pathToCode}`);
  } catch (error) {
    console.error("Error updating component:", error);
  }
}

function promptUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once("data", (data) => resolve(data.toString()));
  });
}

function getGitDiff(filePath: string, newContent: string): string {
    try {
      // Check if the file is tracked in Git
      execSync(`git ls-files --error-unmatch ${filePath}`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
  
      // Get the last committed version of the file
      const previousContent = execSync(`git show HEAD:${filePath}`, {
        encoding: "utf-8",
      });
  
      // Generate diff
      const diff = execSync(`git diff --unified=3 --word-diff=plain`, {
        input: `${previousContent}\n---\n${newContent}`,
        encoding: "utf-8",
      });
  
      return diff.trim();
    } catch (error) {
      console.warn(`File "${filePath}" is either new or not committed yet. Proceeding without Git diff.`);
      return "";
    }
  }
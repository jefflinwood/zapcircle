import fs from "fs";
import path from "path";

const MAX_TOKENS = 3000;

function loadAndTrimFile(filePath: string): string {
  const fullPath = path.resolve(filePath);
  const fileContent = fs.readFileSync(fullPath, "utf-8");

  let trimmedContent = removeComments(fileContent);
  trimmedContent = trimUnnecessarySections(trimmedContent);

  if (countTokens(trimmedContent) > MAX_TOKENS) {
    trimmedContent = truncateToMaxTokens(trimmedContent);
  }

  return trimmedContent;
}

function removeComments(content: string): string {
  return content
    .replace(/\/\/.*$/gm, "") // Remove inline comments
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove block comments
}

function trimUnnecessarySections(content: string): string {
  const exportRegex = /export\s+(const|let|var|function)\s+\w+/g;
  const matches = content.match(exportRegex);

  if (matches) {
    const neededExports = matches.join("\n");
    return neededExports + "\n" + content;
  }

  return content;
}

function countTokens(content: string): number {
  return content.split(/\s+/).length;
}

function truncateToMaxTokens(content: string): string {
  const tokens = content.split(/\s+/);

  let currentTokens = 0;
  let truncatedContent = "";

  for (const token of tokens) {
    currentTokens += 1;
    if (currentTokens > MAX_TOKENS) break;
    truncatedContent += token + " ";
  }

  return truncatedContent.trim();
}

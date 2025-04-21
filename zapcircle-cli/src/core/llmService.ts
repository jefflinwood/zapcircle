// llmService.ts
import { loadUserConfig } from "./config";
import { getLLMClient } from "./llmProviders";
import "dotenv/config";

export async function invokeLLM(
  prompt: string,
  isVerbose: boolean,
  isLarge = false,
): Promise<string> {
  const config = loadUserConfig();
  const llm = getLLMClient(config, isLarge);

  if (isVerbose) {
    console.log("Provider: " + config.provider || "openai");
    console.log("Prompt: " + prompt);
  }

  const response = await llm.invoke(prompt);
  let result: string;

  if (typeof response === "string") {
    result = response;
  } else if (typeof response?.content === "string") {
    result = response.content;
  } else if (Array.isArray(response?.content)) {
    // Some streaming models (like OpenAI via LangChain) may return a list of chunks
    result = response.content.map((chunk: any) => chunk?.text || chunk).join("");
  } else {
    result = JSON.stringify(response, null, 2); // Fallback for unknown structure
  }

  
  if (isVerbose) {
    console.log("Response: " + result);
  }

  return result;
}
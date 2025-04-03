import { ChatOpenAI } from "@langchain/openai";
import { loadUserConfig } from "./config";
import "dotenv/config";

export async function invokeLLM(
  prompt: string,
  isVerbose: boolean,
  isLarge = false,
) {
  const userConfig = loadUserConfig();

  const smallModel = userConfig.models?.small || "gpt-4o-mini";
  const largeModel = userConfig.models?.large || "gpt-4o";
  const modelName = isLarge ? largeModel : smallModel;

  // Get the OpenAI API key from configuration or environment variable
  const openAIKey = userConfig.apiKey || process.env.OPENAI_API_KEY;

  if (!openAIKey) {
    throw new Error(
      "OpenAI API key is not configured in zapcircle.cli.toml or the environment.",
    );
  }

  const model = new ChatOpenAI({
    model: modelName,
    openAIApiKey: openAIKey,
  });

  try {
    if (isVerbose) {
      console.log("Model: " + modelName);
      console.log("Prompt: " + prompt);
    }

    const response = await model.invoke(prompt);
    const result = response.content.toString();

    if (isVerbose) {
      console.log("Response: " + result);
    }
    return result;
  } catch (error) {
    console.error("Error invoking LLM:", error);
    throw error;
  }
}

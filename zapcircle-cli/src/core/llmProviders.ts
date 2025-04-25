// llmProvider.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { CustomLocalLLM } from "./CustomLocalLLM";

export function getLLMClient(config: any, isLarge: boolean) {
  const provider = config.provider || "openai";
  const providerBlock = config[provider] || {};

  const modelName = isLarge
    ? providerBlock.large
    : providerBlock.small;

  if (!modelName) {
    throw new Error(
      `Model not configured for provider "${provider}" (${isLarge ? "large" : "small"})`,
    );
  }


  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        model: modelName,
        openAIApiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY,
      });

    case "anthropic":
      return new ChatAnthropic({
        modelName,
        anthropicApiKey: config.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY,
      });

    case "google":
      return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: config.google?.apiKey || process.env.GOOGLE_API_KEY,
      });

    case "local":
      return new CustomLocalLLM({
        baseUrl: config.local?.baseUrl || "http://localhost:1234",
        modelName,
      });

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
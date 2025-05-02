// llmProvider.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { CustomLocalLLM } from "./CustomLocalLLM";

export function getLLMClient(
  config: any,
  isLarge: boolean,
  provider: string | undefined = undefined,
  model: string | undefined = undefined,
) {
  if (provider && model) {
    const providerBlock = config[provider];
    if (providerBlock) {
      return getLLMClientDirect(
        provider,
        model,
        providerBlock["apiKey"],
        providerBlock["baseUrl"],
      );
    } else {
      return getLLMClientDirect(provider, model);
    }
  }

  const configuredProvider = config.provider || "openai";
  let providerBlock = config[configuredProvider] || {};

  const modelName = isLarge ? providerBlock.large : providerBlock.small;

  if (!modelName) {
    throw new Error(
      `Model not configured for provider "${provider}" (${isLarge ? "large" : "small"})`,
    );
  }

  return getLLMClientDirect(
    configuredProvider,
    modelName,
    providerBlock.apiKey,
    providerBlock.baseUrl,
  );
}
export function getLLMClientDirect(
  provider: string,
  modelName: string,
  apiKey?: string,
  baseUrl?: string,
) {
  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        model: modelName,
        openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
      });

    case "anthropic":
      return new ChatAnthropic({
        modelName,
        anthropicApiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });

    case "google":
      return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: apiKey || process.env.GOOGLE_API_KEY,
      });

    case "local":
      return new CustomLocalLLM({
        baseUrl: baseUrl || "http://localhost:1234",
        modelName,
      });

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

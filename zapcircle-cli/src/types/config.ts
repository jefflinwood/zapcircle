// types/config.ts
export interface UserConfig {
  provider?: string;
  preferredLLM?: string;
  models?: {
    large?: string;
    small?: string;
  };
  openai?: {
    apiKey?: string;
  };
  anthropic?: {
    apiKey?: string;
  };
  google?: {
    apiKey?: string;
  };
  local?: {
    baseUrl?: string;
  };
}

export interface ProjectConfig {
  prompts?: {
    all?: string;
    analyze?: string;
    generate?: string;
  };
  "filetype.generate"?: Record<string, string>;
}

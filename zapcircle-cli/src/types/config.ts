// types/config.ts
export interface UserConfig {
  provider?: string;
  preferredLLM?: string;
  openai?: {
    apiKey?: string;
    large?: string;
    small?: string;
  };
  anthropic?: {
    apiKey?: string;
    large?: string;
    small?: string;
  };
  google?: {
    apiKey?: string;
    large?: string;
    small?: string;
  };
  local?: {
    baseUrl?: string;
    large?: string;
    small?: string;
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

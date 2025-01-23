// types/config.ts
export interface UserConfig {
    preferredLLM?: string;
    models?: {
      large?: string;
      small?: string;
    };
    apiKey?: string;
  }
  
  export interface ProjectConfig {
    prompts?: {
      all?: string;
      analyze?: string;
      generate?: string;
    };
    'filetype.generate'?: Record<string, string>;
  }
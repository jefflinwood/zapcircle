// CustomLocalLLM.ts
export class CustomLocalLLM {
  modelName: string;
  baseUrl: string;

  constructor(opts: { modelName: string; baseUrl: string }) {
    this.modelName = opts.modelName;
    this.baseUrl = opts.baseUrl;
  }

  async invoke(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelName,
        prompt,
      }),
    });

    const json = await response.json();
    return json.completion || json.text || JSON.stringify(json);
  }
}

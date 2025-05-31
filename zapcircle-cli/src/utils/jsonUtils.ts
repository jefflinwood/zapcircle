// zapcircle/utils/jsonUtils.ts

/**
 * Attempts to extract the first valid JSON object from a string.
 * This is useful when the LLM wraps JSON in markdown-style code blocks.
 */
export function extractJSONBlock(input: string): string {
  const codeBlockMatch = input.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return input.trim();
}

/**
 * Parses an LLM response into a JS object, stripping markdown if needed.
 */
export function safeParseJSON<T = any>(input: string): T {
  const cleaned = extractJSONBlock(input);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`❌ Failed to parse JSON from input:\n${cleaned}`);
  }
}

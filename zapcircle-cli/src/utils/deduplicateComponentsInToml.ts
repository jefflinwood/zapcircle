import toml from "@iarna/toml";

/**
 * Deduplicates [[components]] blocks in a TOML string by component `name`.
 * Keeps the last defined block for any duplicates.
 */
export function deduplicateComponentsInToml(tomlString: string): string {
  let parsed: any;

  try {
    parsed = toml.parse(tomlString);
  } catch (err) {
    console.warn("⚠️ Failed to parse TOML for deduplication:", err);
    return tomlString; // Return original if it fails
  }

  if (!Array.isArray(parsed.components)) return tomlString;

  const seen = new Map<string, any>();

  for (const component of parsed.components) {
    if (!component.name) continue;
    seen.set(component.name, { ...seen.get(component.name), ...component });
  }

  parsed.components = Array.from(seen.values());

  return toml.stringify(parsed);
}
import { JsonMap, parse } from "@iarna/toml";
import { join } from "path";

interface StateVariable {
  name: string;
  path: string;
}

interface ParsedToml {
  state: Record<string, any>;
}

function extractSharedStateFromBehavior(
  tomlContent: string,
  projectRoot: string,
): string[] {
  const parsed: JsonMap = parse(tomlContent);
  const stateVariables: StateVariable[] = [];

  if (parsed["state"]) {
    for (const [key, value] of Object.entries(parsed.state)) {
      const stateVariable: StateVariable = {
        name: key,
        path: join(projectRoot, value.path),
      };
      stateVariables.push(stateVariable);
    }
  }

  return stateVariables.map((variable) => variable.path);
}

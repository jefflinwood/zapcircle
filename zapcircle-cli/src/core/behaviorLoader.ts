// src/core/behaviorLoader.ts

import { existsSync, readFileSync } from "fs";

export function loadBehaviorFile(filePath: string): string | null {
  const behaviorFilePath = `${filePath}.zap.toml`;
  if (existsSync(behaviorFilePath)) {
    return readFileSync(behaviorFilePath, "utf-8");
  }
  return null;
}

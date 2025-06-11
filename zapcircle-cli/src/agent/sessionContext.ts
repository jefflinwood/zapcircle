// agent/sessionContext.ts

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { Session } from "inspector/promises";
import path from "path";

const sessionPath = path.resolve(".zapcircle/agent/session.json");
const sessionDir = path.dirname(sessionPath);

export type SessionContext = {
  lastEditedComponent?: string;
  lastIssueId?: number;
  lastAcceptedPlanAt?: string;
  stylePreferences?: Record<string, string>;
};

let cache: SessionContext | null = null;

export function getSessionContext(): SessionContext {
  if (cache) return cache;

  if (!existsSync(sessionPath)) {
    return {};
  }

  try {
    const raw = readFileSync(sessionPath, "utf-8");
    cache = JSON.parse(raw);
    return cache ?? {};
  } catch (err) {
    console.warn("⚠️ Failed to read session context:", err);
    return {};
  }
}

export function updateSessionContext(update: Partial<SessionContext>) {
  const current = getSessionContext();
  const merged = { ...current, ...update };
  cache = merged;

  try {
    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir, { recursive: true });
    }
    writeFileSync(sessionPath, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to write session context:", err);
  }
}

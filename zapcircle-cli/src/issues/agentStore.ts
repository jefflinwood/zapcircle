// agent/AgentStore.ts

import path from "path";
import toml from "@iarna/toml";
import fs from "fs";
import { AgentIssue } from "../issues/types";

const issuesDir = path.resolve(".zapcircle/agent/issues");

export class AgentStore {
  constructor() {
    if (!fs.existsSync(issuesDir)) {
      fs.mkdirSync(issuesDir, { recursive: true });
    }
  }

  listIssues(): AgentIssue[] {
    const files = fs.readdirSync(issuesDir).filter((f) => f.endsWith(".toml"));
    return files
      .map((file) => this.readIssue(parseInt(file.replace(".toml", ""))))
      .filter(Boolean) as AgentIssue[];
  }

  readIssue(id: number): AgentIssue | null {
    const filePath = path.join(issuesDir, `${id}.toml`);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const issue = toml.parse(raw) as AgentIssue;
    return issue;
  }

  writeIssue(issue: AgentIssue): void {
    const filePath = path.join(issuesDir, `${issue.id}.toml`);
    const raw = toml.stringify(issue);
    fs.writeFileSync(filePath, raw, "utf-8");
  }

  advanceIssueState(id: number, updates: Partial<AgentIssue>): void {
    const existing = this.readIssue(id);
    if (!existing) {
      throw new Error(`Issue ${id} not found.`);
    }
    const merged = { ...existing, ...updates };
    this.writeIssue(merged);
  }

  getNextPending(): AgentIssue | null {
    const queue = this.listIssues().filter((i) => i.status === "pending");
    return queue.length > 0 ? queue[0] : null;
  }
}

export const store = new AgentStore();

export type AgentIssue = {
  id: number;
  status: "pending" | "completed" | "failed";
  source: "chat" | "github" | "jira" | "linear";
  priority: "Low" | "Medium" | "High";
  title: string;
  description: string;
  createdAt: string;
  author: string;
  comments: AgentComment[];
};

export type AgentComment = {
  author: string;
  createdAt: string;
  body: string;
};

export type SyncLogEntry = {
  timestamp: string;
  issueId: number;
  action: "read" | "write" | "pull" | "push";
  source: "local" | "github" | "jira" | "linear";
  note?: string;
};

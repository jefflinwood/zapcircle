export interface BehaviorDriftResult {
  behaviorChanges: {
    line: string;
    severity: string;
    message: string;
  }[];
  breakingChanges: string[];
}

export interface PRSummary {
  pullRequestBehaviorSummary: string[];
  reviewerAttention: string[];
  breakingChanges: string[];
  productOwnerSummary: string;
  statusDigest: string;
}

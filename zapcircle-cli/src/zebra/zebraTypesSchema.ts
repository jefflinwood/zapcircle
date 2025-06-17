import { z } from "zod";
import { BehaviorDriftResult, PRSummary } from "./zebraTypes";

// Behavior Drift (file-level)
export const BehaviorDriftSchema = z.object({
  behaviorChanges: z.array(
    z.object({
      line: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      message: z.string(),
    }),
  ),
  breakingChanges: z.array(z.string()),
});

// PR Summary (summary-level)
export const PRSummarySchema = z.object({
  pullRequestBehaviorSummary: z.array(z.string()),
  reviewerAttention: z.array(z.string()),
  breakingChanges: z.array(z.string()),
  productOwnerSummary: z.string(),
  statusDigest: z.string(),
});

// Type exports derived directly from Zod
export type BehaviorDriftResultValidated = z.infer<typeof BehaviorDriftSchema>;
export type PRSummaryValidated = z.infer<typeof PRSummarySchema>;

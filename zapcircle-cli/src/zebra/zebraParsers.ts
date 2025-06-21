import { safeParseJSON } from "../utils/jsonUtils";
import { BehaviorDriftSchema, PRSummarySchema } from "./zebraTypesSchema";

export function parseBehaviorDrift(raw: string) {
  const parsed = safeParseJSON(raw);
  const validated = BehaviorDriftSchema.parse(parsed);
  return validated;
}

export function parsePRSummary(raw: string) {
  const parsed = safeParseJSON(raw);
  const validated = PRSummarySchema.parse(parsed);
  return validated;
}

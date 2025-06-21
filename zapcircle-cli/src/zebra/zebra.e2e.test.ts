import {
  parseBehaviorDrift,
  parsePRSummary,
} from "../../src/zebra/zebraParsers";
import fs from "fs";

describe("Zebra Golden Path E2E Test", () => {
  it("should parse file-level behavior drift correctly", () => {
    const raw = fs.readFileSync(
      "./.tests/zebra/fixtures/behaviorDrift.json",
      "utf-8",
    );
    const result = parseBehaviorDrift(raw);
    expect(result.behaviorChanges.length).toBeGreaterThan(0);
  });

  it("should parse summary output correctly", () => {
    const raw = fs.readFileSync(
      "./.tests/zebra/fixtures/prSummary.json",
      "utf-8",
    );
    const result = parsePRSummary(raw);
    expect(result.pullRequestBehaviorSummary.length).toBeGreaterThan(0);
    expect(result.statusDigest).toBeDefined();
  });
});

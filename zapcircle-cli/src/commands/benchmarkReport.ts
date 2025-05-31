import fs from "fs";
import path from "path";
import { safeParseJSON } from "../utils/jsonUtils";

interface ReportRow {
  task: string;
  codeOnly: number;
  behavior: number;
  winner: string;
  notes: string;
}

export async function benchmarkReport(options: { outputDir?: string }) {
  const outputDir = options.outputDir || ".zapcircle/benchmark/output";
  const results: ReportRow[] = [];

  const taskDirs = fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const task of taskDirs) {
    const taskPath = path.join(outputDir, task);

    try {
      const codeOnlyPath = path.join(taskPath, "code-only-eval.json");
      const behaviorPath = path.join(taskPath, "with-behavior-eval.json");

      if (!fs.existsSync(codeOnlyPath) || !fs.existsSync(behaviorPath)) {
        console.warn(`⚠️ Skipping ${task} — missing evaluation results.`);
        continue;
      }

      const codeOnlyEval = safeParseJSON(
        fs.readFileSync(codeOnlyPath, "utf-8"),
      );
      const behaviorEval = safeParseJSON(
        fs.readFileSync(behaviorPath, "utf-8"),
      );

      const winner =
        behaviorEval.score > codeOnlyEval.score
          ? "✅ Behavior"
          : behaviorEval.score < codeOnlyEval.score
            ? "❌ Code Only"
            : "➖ Tie";

      results.push({
        task,
        codeOnly: codeOnlyEval.score,
        behavior: behaviorEval.score,
        winner,
        notes: behaviorEval.explanation?.slice(0, 100) + "...",
      });
    } catch (err) {
      console.error(`❌ Error parsing benchmark result for ${task}:`, err);
    }
  }

  console.log("\n📊 ZapCircle Benchmark Report");
  console.table(results);
}

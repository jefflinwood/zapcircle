// zapcircle/commands/benchmarkReportTests.ts
import fs from "fs";
import path from "path";
import { safeParseJSON } from "../utils/jsonUtils";

interface ReportRow {
  model: string;
  task: string;
  codeOnly: number;
  behavior: number;
  winner: string;
  notes: string;
}

export async function benchmarkReportTests(options: { outputDir?: string }) {
  const outputDir = options.outputDir || ".zapcircle/benchmark/output";
  const results: ReportRow[] = [];

  const modelDirs = fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const modelName of modelDirs) {
    const modelPath = path.join(outputDir, modelName);

    const taskDirs = fs
      .readdirSync(modelPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const task of taskDirs) {
      const taskPath = path.join(modelPath, task);

      try {
        const codeOnlyPath = path.join(taskPath, "code-only-test-eval.json");
        const behaviorPath = path.join(
          taskPath,
          "with-behavior-test-eval.json",
        );

        if (!fs.existsSync(codeOnlyPath) || !fs.existsSync(behaviorPath)) {
          console.warn(
            `⚠️ Skipping ${modelName}/${task} — missing test evaluation results.`,
          );
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
          model: modelName,
          task,
          codeOnly: codeOnlyEval.score,
          behavior: behaviorEval.score,
          winner,
          notes: behaviorEval.explanation?.slice(0, 100) + "...",
        });
      } catch (err) {
        console.error(
          `❌ Error parsing test result for ${modelName}/${task}:`,
          err,
        );
      }
    }
  }

  console.log("\n🧪 ZapCircle Benchmark Test Report");
  console.table(results);
}

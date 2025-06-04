// zapcircle/commands/benchmarkRunAll.ts
import fs from "fs";
import path from "path";
import { runBenchmark } from "./benchmark";
import { generateTestsForBenchmark } from "./benchmarkGenerateTests";

export async function runAllBenchmarks(options: {
  outputDir?: string;
  provider?: string;
  model?: string;
  verbose?: boolean;
  includeTests?: boolean;
}) {
  const tasksDir = ".zapcircle/benchmark/tasks";
  const taskDirs = fs
    .readdirSync(tasksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const taskName of taskDirs) {
    try {
      await runBenchmark({
        taskName,
        outputDir: options.outputDir,
        provider: options.provider,
        model: options.model,
        verbose: options.verbose,
      });

      if (options.includeTests) {
        await generateTestsForBenchmark({
          taskName,
          outputDir: options.outputDir,
          provider: options.provider,
          model: options.model,
          verbose: options.verbose,
        });
      }
    } catch (err) {
      console.error(`❌ Failed to run benchmark for ${taskName}:`, err);
    }
  }

  console.log("\n✅ All benchmarks complete.");
}

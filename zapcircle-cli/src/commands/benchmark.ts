// zapcircle/commands/benchmark.ts
import path from "path";
import fs from "fs";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { writeFileSync } from "fs";
import { semanticDiffLLM } from "../utils/diffUtils";

interface BenchmarkOptions {
  taskName: string;
  llm?: string;
  outputDir?: string;
  verbose?: boolean;
}

export async function runBenchmark(options: BenchmarkOptions) {
  const {
    taskName,
    llm = "gpt-4",
    outputDir = ".zapcircle/benchmark/output",
    verbose = false,
  } = options;

  const taskDir = path.resolve(`.zapcircle/benchmark/tasks/${taskName}`);
  const issuePath = path.join(taskDir, "issue.md");
  const codePath = path.join(taskDir, "component.tsx");
  const behaviorPath = path.join(taskDir, "behavior.zap.toml");
  const expectedPath = path.join(taskDir, "expected.tsx");

  if (!fs.existsSync(issuePath) || !fs.existsSync(codePath)) {
    throw new Error(
      `Missing issue.md or component.tsx for benchmark task: ${taskName}`,
    );
  }

  const issue = fs.readFileSync(issuePath, "utf8");
  const baseCode = fs.readFileSync(codePath, "utf8");
  const behavior = fs.existsSync(behaviorPath)
    ? fs.readFileSync(behaviorPath, "utf8")
    : null;

  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`▶️ Running benchmark: ${taskName}`);

  // Code-only generation
  const codeOnlyPrompt = `Here is the existing code:\n\n${baseCode}\n\nPlease implement the following issue:\n${issue}`;
  const codeOnlyResult = await invokeLLMWithSpinner(codeOnlyPrompt, true);
  const codeOnlyOutputPath = path.join(outputDir, "code-only.tsx");
  writeFileSync(codeOnlyOutputPath, codeOnlyResult);
  if (verbose) console.log("🔍 Code Only Output:\n", codeOnlyResult);

  // Code + Behavior generation
  const withBehaviorPrompt = behavior
    ? `Here is the existing code:\n\n${baseCode}\n\nHere is the behavior:\n\n${behavior}\n\nPlease implement the following issue:\n${issue}`
    : codeOnlyPrompt;

  const behaviorResult = await invokeLLMWithSpinner(withBehaviorPrompt, true);
  const behaviorOutputPath = path.join(outputDir, "with-behavior.tsx");
  writeFileSync(behaviorOutputPath, behaviorResult);
  if (verbose) console.log("📘 With Behavior Output:\n", behaviorResult);

  // Semantic Evaluation vs Expected
  if (fs.existsSync(expectedPath)) {
    const expected = fs.readFileSync(expectedPath, "utf8");

    const diffCodeOnly = await semanticDiffLLM({
      issue,
      expected,
      generated: codeOnlyResult,
      model: llm,
    });

    const diffWithBehavior = await semanticDiffLLM({
      issue,
      expected,
      generated: behaviorResult,
      model: llm,
    });

    console.log("\n📊 Semantic Evaluation vs Expected:");
    console.log("- Code Only:");
    console.log(`  ✔️ Satisfied: ${diffCodeOnly.satisfied}`);
    console.log(`  📈 Score: ${diffCodeOnly.score}/5`);
    console.log(`  🧠 Explanation: ${diffCodeOnly.explanation}`);

    console.log("\n- With Behavior:");
    console.log(`  ✔️ Satisfied: ${diffWithBehavior.satisfied}`);
    console.log(`  📈 Score: ${diffWithBehavior.score}/5`);
    console.log(`  🧠 Explanation: ${diffWithBehavior.explanation}`);
  } else {
    console.warn("⚠️ No expected.tsx found — skipping semantic evaluation.");
  }

  console.log("✅ Benchmark complete.");
}

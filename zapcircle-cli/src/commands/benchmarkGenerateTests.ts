// zapcircle/commands/benchmarkGenerateTests.ts
import fs from "fs";
import path from "path";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { semanticDiffLLM } from "../utils/diffUtils";

export async function generateTestsForBenchmark(options: {
  taskName: string;
  provider?: string;
  model?: string;
  outputDir?: string;
  verbose?: boolean;
}) {
  const {
    taskName,
    outputDir = ".zapcircle/benchmark/output",
    provider = "openai",
    model = "gpt-4",
    verbose = false,
  } = options;

  const taskDir = path.resolve(`.zapcircle/benchmark/tasks/${taskName}`);
  const componentPath = path.join(taskDir, "expected.tsx");
  const behaviorPath = path.join(taskDir, "behavior.zap.toml");
  const expectedTestPath = path.join(taskDir, "expected.test.tsx");

  if (!fs.existsSync(componentPath) || !fs.existsSync(expectedTestPath)) {
    console.warn(
      `⚠️ Skipping ${taskName} — missing expected.tsx or expected.test.tsx`,
    );
    return;
  }

  const componentCode = fs.readFileSync(componentPath, "utf8");
  const expectedTest = fs.readFileSync(expectedTestPath, "utf8");
  const behavior = fs.existsSync(behaviorPath)
    ? fs.readFileSync(behaviorPath, "utf8")
    : null;

  const modelSlug = `${provider}-${model}`;
  const taskOutputDir = path.join(outputDir, modelSlug, taskName);
  fs.mkdirSync(taskOutputDir, { recursive: true });

  const testPrompt = (withBehavior: boolean) => `
Here is the component:

${componentCode}

${
  withBehavior && behavior
    ? `Here is the behavior:

${behavior}

`
    : ""
}Please generate a test suite for this component using Vitest and React Testing Library. Use best practices for structure and coverage.
`;

  const codeOnlyTest = await invokeLLMWithSpinner(
    testPrompt(false),
    false,
    false,
    true,
    provider,
    model,
  );
  const behaviorTest = await invokeLLMWithSpinner(
    testPrompt(true),
    false,
    false,
    true,
    provider,
    model,
  );

  const codeOnlyTestPath = path.join(taskOutputDir, "code-only.test.tsx");
  const behaviorTestPath = path.join(taskOutputDir, "with-behavior.test.tsx");
  fs.writeFileSync(codeOnlyTestPath, codeOnlyTest);
  fs.writeFileSync(behaviorTestPath, behaviorTest);

  const codeOnlyEval = await semanticDiffLLM({
    issue: `Generate tests for the component`,
    expected: expectedTest,
    generated: codeOnlyTest,
    model,
  });

  const behaviorEval = await semanticDiffLLM({
    issue: `Generate tests for the component`,
    expected: expectedTest,
    generated: behaviorTest,
    model,
  });

  const codeOnlyEvalPath = path.join(taskOutputDir, "code-only-test-eval.json");
  const behaviorEvalPath = path.join(
    taskOutputDir,
    "with-behavior-test-eval.json",
  );
  fs.writeFileSync(codeOnlyEvalPath, JSON.stringify(codeOnlyEval, null, 2));
  fs.writeFileSync(behaviorEvalPath, JSON.stringify(behaviorEval, null, 2));

  if (verbose) {
    console.log("\n🧪 Test Evaluation:");
    console.log("- Code Only:", codeOnlyEval);
    console.log("- With Behavior:", behaviorEval);
  }

  console.log(`✅ Finished test generation and evaluation for ${taskName}`);
}

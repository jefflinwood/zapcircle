#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../../package.json";
import { generateComponent } from "../commands/generate";
import { analyze } from "../commands/analyze";
import { initProject } from "../commands/init";
import { configureZapCircle } from "../commands/configure";
import { checkZapCircleStatus } from "../commands/status";
import { generateTests } from "../commands/generateTests";
import { updateCode } from "../commands/updateCode";
import { review } from "../commands/review";
import { distill } from "../commands/distill";
import { context } from "../commands/context";
import { zapcircleNew } from "../commands/new";
import { agentRunCommand } from "../commands/agent";
import { showAgentStatus } from "../agent/status";
import { runAgentChat } from "../agent/chat";
import { runBenchmark } from "../commands/benchmark";

const program = new Command();

program
  .name("ZapCircle CLI")
  .description(
    "Command-line tool for the ZapCircle Behavior Driven Development SDK",
  )
  .version(version);

program
  .command("analyze <filetype> <path>")
  .description(
    "Analyze the provided file or directory for <filetype> - such as jsx",
  )
  .option("--verbose", "Display LLM prompt and response in the console log")
  .option("--interactive", "Prompt before overwriting existing files")
  .action((filetype, path, options) => {
    console.log(`Analyzing filetype "${filetype}" for the path "${path}"...`);
    analyze(filetype, path, options);
  });

program
  .command("generate <filetype> <pathToToml>")
  .description("Generate a file from the provided .zap.toml file")
  .option("--verbose", "Display LLM prompt and response in the console log")
  .option("--interactive", "Prompt before overwriting existing files")
  .action((filetype, pathToToml, options) => {
    console.log(`Generating "${filetype}" from "${pathToToml}"...`);
    generateComponent(filetype, pathToToml, options);
  });

program
  .command("generateTests <filetype> <pathToToml> <pathToCode>")
  .description(
    "Generate test files from the provided .zap.toml file and source code file",
  )
  .option("--verbose", "Display LLM prompt and response in the console log")
  .action((filetype, pathToToml, pathToCode, options) => {
    console.log(
      `Generating tests "${filetype}" from "${pathToToml}" for "${pathToCode}"...`,
    );
    generateTests(filetype, pathToToml, pathToCode, options);
  });

program
  .command("update <pathToToml> <pathToCode>")
  .description(
    "Update code based on the changes in its .zap.toml behavior file",
  )
  .option("--verbose", "Display LLM prompt and response in the console log")
  .option("--review", "Enable interactive review before applying changes")
  .option("--diff-only", "Show the difference but do not apply updates")
  .action((pathToToml, pathToCode, options) => {
    console.log(`Updating code in "${pathToCode}" based on "${pathToToml}"...`);
    updateCode(pathToToml, pathToCode, options);
  });

program
  .command("review")
  .description("Run a pull-request review for any issues")
  .option(
    "--provider <provider>",
    "LLM provider to use (e.g., openai, anthropic, google, local)",
  )
  .option(
    "--model <model>",
    "Model to use (e.g., o4-mini, claude-3-opus, gemini-2.0-flash)",
  )
  .option("--verbose", "Display LLM prompt and response in the console log")
  .option("--github", "Post review to GitHub")
  .option(
    "--contextLimit",
    "Number of tokens to use for context limit (default: 128000)",
  )
  .option("--baseBranch", "Base branch to use (default: origin/main)")
  .action((options) => {
    console.log(`Running ZapCircle Review...`);
    review(options);
  });

program
  .command("new <projectType> [pathToCode] [ideaPrompt]")
  .description(
    "Create a new application from an idea. Supports react-tsx as a project type.",
  )
  .option("--verbose", "Display LLM prompt and response in the console log")
  .option(
    "--interactive",
    "Operate in interactive mode, ask for input (default)",
  )
  .action((projectType, pathToCode, ideaPrompt, options) => {
    console.log(`Running ZapCircle New...`);
    zapcircleNew(projectType, pathToCode, ideaPrompt, options);
  });

program
  .command("distill <pathToCode>")
  .description(
    "Create a summary distillation of the current code project to use with LLMs as context.",
  )
  .option(
    "--output",
    "Directory to place the output zapcircle.distill.toml file",
  )
  .action((pathToCode, options) => {
    console.log(`Running ZapCircle Distill...`);
    distill(pathToCode, options);
  });

program
  .command("context <pathToCode>")
  .description(
    "Generate a consolidated text file of source code for LLM context, including estimated token count.",
  )
  .option(
    "--output <directory>",
    "Directory to place the output zapcircle.context.txt file",
  )
  .action((pathToCode, options) => {
    console.log(`Running ZapCircle Context...`);
    context(pathToCode, options);
  });

const agent = program
  .command("agent")
  .description("ZapCircle Agentic AI - contains subcommands");

agent.command("run").action(() => {
  console.log(`Running ZapCircle agent run...`);
  agentRunCommand();
});

agent.command("status").action(() => {
  console.log(`Displaying ZapCircle agent status...`);
  showAgentStatus();
});

agent.command("chat").action(() => {
  runAgentChat();
});

program
  .command("benchmark <taskName>")
  .action((taskName) => runBenchmark({ taskName: taskName }));

program
  .command("configure")
  .description(
    "Configure the ZapCircle CLI (e.g., set preferred LLMs and API keys)",
  )
  .action(() => {
    console.log(`Configuring ZapCircle CLI...`);
    configureZapCircle();
  });

program
  .command("init")
  .description("Initialize a new project with ZapCircle")
  .action(() => {
    console.log(`Initializing new ZapCircle project...`);
    initProject();
  });

program
  .command("status")
  .description("Show the current ZapCircle configuration status")
  .action(() => {
    console.log(`Checking ZapCircle status...`);
    checkZapCircleStatus();
  });

if (require.main === module) {
  program.parse(process.argv);
}

export { program };

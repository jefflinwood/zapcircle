import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { readdirSync } from "fs";
import { join } from "path";
import path from "path";
import toml from "@iarna/toml";
import { invokeLLMWithSpinner } from "../commandline/invokeLLMWithSpinner";
import { scaffoldBehaviorsFromProject } from "./new/scaffoldBehaviors";
import { zapcircleValidate } from "./validate";
import { generateAllComponents } from "./new/generateAllComponents";
import { loadPrompt } from "../core/promptLoader";
import { deduplicateComponentsInToml } from "../utils/deduplicateComponentsInToml";
import { createBaseProjectWithVite } from "./new/createBaseProjectWithVite";
import { getHomeDir } from "../utils/platformUtils";

export async function zapcircleNew(
  initialProjectType: string,
  projectDir: string = ".",
  ideaPrompt?: string,
  options: { interactive?: boolean; output?: string; verbose?: boolean } = {},
) {
  const outputDir = path.resolve(projectDir);
  const projectTomlPath = path.join(outputDir, "project.zap.toml");
  const isVerbose = options.verbose || false;
  const isInteractive = options.interactive || true;

  const readline = await import("readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // 🔒 Step 0: Check for user configuration
  const userConfigDir = path.join(getHomeDir(), ".zapcircle");
  const userConfigPath = path.join(userConfigDir, "zapcircle.cli.toml");
  if (!existsSync(userConfigPath)) {
    console.log("⚠️  ZapCircle is not configured yet.");
    console.log("👉 Run `zapcircle configure` before continuing.\n");
    rl.close();
    process.exit(1);
  }

  // 🧠 Step 1: Get project idea
  console.log("💡 Let's define your new project");
  if (!ideaPrompt) {
    ideaPrompt = await rl.question("What are you building? ");
  }
  rl.close();

  console.log(`📌 Got it — you're building: "${ideaPrompt}"`);

  // 🧠 Step 2: Project type (for now hardcoded, but confirm)
  const projectType = "react-tsx";
  console.log(`📦 Project type: ${projectType}`);

  // 🧠 Step 3: Output directory confirmation
  console.log(`📁 Output directory: ${outputDir}`);

  // Step 4: Create base project if needed
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("🔧 Setting up base project with Vite...");
    await createBaseProjectWithVite(projectDir, isVerbose);
  } else if (isVerbose) {
    console.log("📦 Existing project detected — skipping base setup.");
  }

  // Step 5: Generate or reuse project.zap.toml
  let tomlContents = "";
  if (existsSync(projectTomlPath)) {
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const useExisting = await rl2.question(
      `📝 A project.zap.toml file already exists. Use it? (Y/n): `,
    );
    rl2.close();
    if (useExisting.trim().toLowerCase() === "n") {
      const prompt = await loadPrompt(projectType, "new", { ideaPrompt });
      let rawToml = await invokeLLMWithSpinner(prompt, isVerbose);
      rawToml = deduplicateComponentsInToml(rawToml);
      writeFileSync(projectTomlPath, rawToml);
      console.log(`📄 Overwrote ${projectTomlPath}`);
    } else {
      tomlContents = readFileSync(projectTomlPath, "utf-8");
      console.log(`📄 Using existing ${projectTomlPath}`);
    }
  } else {
    const prompt = await loadPrompt(projectType, "new", { ideaPrompt });
    tomlContents = await invokeLLMWithSpinner(prompt, isVerbose);
    writeFileSync(projectTomlPath, tomlContents);
    console.log(`📄 Created ${projectTomlPath}`);
  }

  // Step 6: Validate TOML
  let parsedProject;
  try {
    const tomlRaw = readFileSync(projectTomlPath, "utf-8");
    parsedProject = toml.parse(tomlRaw);
  } catch (err: any) {
    console.error("❌ Error: project.zap.toml is not valid TOML.");
    console.error(err.message || err);
    console.log(
      "🛠️ Try fixing the file manually, or delete and re-run `zapcircle new`.",
    );
    process.exit(1);
  }

  // 🧾 Step 6.5: Show TOML to user
  console.log("\n🧠 Here's your generated project.zap.toml:\n");
  const lines = tomlContents.trim().split("\n");
  lines.forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3)} | ${line}`);
  });
  console.log(
    "\n✏️  You can edit this file in a text editor before proceeding.\n",
  );

  if (isInteractive) {
    const rl3 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    await rl3.question(
      "🔎 Press Enter to continue once you've reviewed or edited the project.zap.toml...",
    );
    rl3.close();
  }

  // Step 7: Ensure src directory exists
  const srcDir = path.join(outputDir, "src");
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    console.log("📁 Created src directory");
  }

  // Step 8: Scaffold behavior files
  console.log("🔍 Scaffolding behaviors...");
  await scaffoldBehaviorsFromProject(projectTomlPath, {
    output: srcDir,
    interactive: isInteractive,
  });

  // Step 8.5: Show an example behavior file

  const behaviorFiles = readdirSync(srcDir).filter((f) =>
    f.endsWith(".zap.toml"),
  );
  if (behaviorFiles.length > 0) {
    const sampleBehaviorPath = join(srcDir, behaviorFiles[0]);
    const behaviorContents = readFileSync(sampleBehaviorPath, "utf-8");
    console.log(`\n🧠 Example behavior file: ${behaviorFiles[0]}\n`);
    const lines = behaviorContents.trim().split("\n");
    lines.forEach((line, i) => {
      console.log(`${String(i + 1).padStart(3)} | ${line}`);
    });

    if (isInteractive) {
      const rl4 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      await rl4.question(
        "\n✏️  Press Enter to continue once you've reviewed or edited this behavior file, or any others that we just created...",
      );
      rl4.close();
    }
  }

  // Step 9: Generate components
  console.log("⚙️ Generating components...");
  await generateAllComponents(projectType, outputDir, { verbose: isVerbose });

  // Step 10: Validate generated project
  console.log("✅ Validating project...");
  await zapcircleValidate(projectType, outputDir, {
    verbose: isVerbose,
    autofix: true,
  });

  // 🎉 Final Instructions
  // 🎉 Final Instructions
  console.log("\n🎉 Project scaffolding complete!\n");
  console.log("👉 Next steps:");
  console.log("   1. Run the dev server:");
  console.log("        npm run dev");
  console.log("");
  console.log("   2. Edit your generated components in:");
  console.log("        src/");
  console.log("");
  console.log("   3. Want to change what components do?");
  console.log("        Edit the *.zap.toml behavior files in your project.");
  console.log("");
  console.log("   4. Then regenerate source code with:");
  console.log("        npx zapcircle generate");
  console.log("");
  console.log(
    "   5. Before pushing a pull request, get an AI-powered code review:",
  );
  console.log("        npx zapcircle review");
  console.log("");
}

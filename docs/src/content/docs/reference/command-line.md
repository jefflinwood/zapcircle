---
title: ZapCircle Command Line Reference
description: Detailed Description of the Command Line Options for ZapCircle
---

## Overview
The ZapCircle command line interface (CLI) allows developers to analyze files, generate components, and create test files directly from behavior specifications.

To run the `zapcircle` command line tool, typically you would use:

```bash
npx zapcircle <command> <arguments>
```

for example:

```bash
npx zapcircle analyze jsx ./UserDashboard.jsx
```

Below is a detailed reference for each command, including its usage, description, and examples.

---

## Commands

### `analyze`
**Description:**  
Analyze a specified file or directory for a given file type (e.g., `jsx`, `tsx`, etc.). This command inspects the provided path to gather insights or perform static analysis.

**Usage:**
```bash
npx zapcircle analyze <filetype> <path>
```

**Arguments:**
- `<filetype>`: The type of file to analyze (e.g., `jsx`, `tsx`).
- `<path>`: The file or directory path to analyze.

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.
- `--interactive`: Asks before overwriting any existing files.

**Example:**
```bash
npx zapcircle analyze jsx ./src/components
```
**Output:**
```plaintext
Analyzing filetype "jsx" for the path "./src/components"...
```

---

### `generate`
**Description:**  
Generate a new file (e.g., a component) from a `.zap.toml` behavior specification file.

**Usage:**
```bash
npx zapcircle generate <filetype> <pathToToml>
```

**Arguments:**
- `<filetype>`: The type of file to generate (e.g., `jsx`, `ts`).
- `<pathToToml>`: The path to the `.zap.toml` file defining the behavior.

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.
- `--interactive`: Asks before overwriting any existing files.

**Example:**
```bash
npx zapcircle generate jsx ./behaviors/LoginForm.jsx.zap.toml
```
**Output:**
```plaintext
Generating "jsx" from "./behaviors/LoginForm.jsx.zap.toml"...
```

---

### `generateTests`
**Description:**  
Generate test files based on a `.zap.toml` behavior specification.

**Usage:**
```bash
npx zapcircle generateTests <filetype> <pathToToml> <pathToCode>
```

**Arguments:**
- `<filetype>`: The type of test file to generate (e.g., `jsx`, `ts`).
- `<pathToToml>`: The path to the `.zap.toml` file defining the behavior.
- `<pathToCode>`: The path to the source code (such as a `.jsx` file) to be tested.

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.
- `--interactive`: Asks before overwriting any existing files.

**Example:**
```bash
npx zapcircle generateTests jsx ./behaviors/LoginForm.jsx.zap.toml ./src/components/LoginForm.jsx
```

**Output:**
```plaintext
Generating tests "jsx" from "./behaviors/LoginForm.jsx.zap.toml" for "./src/components/LoginForm.jsx"
```

---

### `update`
**Description:**
Update existing code based on a new or modified `.zap.toml` behavior specification.

**Usage:**
```bash
npx zapcircle update <pathToToml> <pathToCode>
```

**Arguments:**
- `<pathToToml>`: The path to the `.zap.toml` file defining the behavior.
- `<pathToCode>`: The path to the source code (such as a `.jsx` file) to be updated.

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.
- `--interactive`: Asks before overwriting any existing files.

**Example:**
```bash
npx zapcircle update ./src/components/LoginForm.jsx.zap.toml ./src/components/LoginForm.jsx
```

**Output:**
```plaintext
Component updated: ./src/components/LoginForm.jsx
```

---

### `context`
**Description:**
Combines all of the important source code files in a project into one `zapcircle.context.txt` file which can be used as the input to an LLM to provide context.

Paths in the `.gitignore` file will not be included.

The estimated number of tokens used for the context file is provided in the command-line output.

This `context` command does not use any LLM calls.

The file will be placed in the current working directory, which can be specified with the `--output` parameter if desired.

You will want to review this file for any sensitive information before sending it over to an LLM.

**Usage:**
```bash
npx zapcircle context <pathToCode>
```

**Arguments:**
- `<pathToCode>`: The path to the source code of the project

**Options**
- `--output`: The output directory for the `zapcircle.context.txt` file.

**Example:**
```bash
npx zapcircle context .
```

**Output:**
```plaintext
Running ZapCircle Context...
Context file created: zapcircle.context.txt
Estimated token count: 142978
```


---

### `distill`
**Description:**
Condenses and distills the most pertinent facts about a JavaScript or TypeScript project, to be included as context with an LLM.

Creates a `zapcircle.distill.toml` file in the output directory, which can be specified with the `--output` parameter if it is not the current working directory.

**Usage:**
```bash
npx zapcircle distill <pathToCode>
```

**Arguments:**
- `<pathToCode>`: The path to the source code of the project

**Options**
- `--output`: The output directory for the `zapcircle.distill.toml` file.

**Example:**
```bash
npx zapcircle distill .
```

**Output:**
```plaintext
Running ZapCircle Distill...
Distill completed: zapcircle.distill.toml
```

---

### `review`
**Description:**
Reviews any code that has been modified based on a `git diff` - can be used from the command line, or within a GitHub Action for a pull request. Uses an LLM to spot issues with individual files, and also asks for a summary review from an LLM for general stylistic details.

The `--github` option will post the results to GitHub to appear within a pull request. Otherwise, the output appears on the console.

**Usage:**
```bash
npx zapcircle review
npx zapcircle review --github
```

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.
- `--github`: Formats the issues and summary for GitHub, and posts to GitHub - use this flag within a GitHub action.

**Example:**
```bash
npx zapcircle review

**Output:**
```plaintext
Running ZapCircle Review...
🔍 Fetching changed files...
🧐 Analyzing 1 modified files...
🔎 Reviewing src/components/Dashboard.tsx...
Processing... done!
✅ No issues found in src/components/Dashboard.tsx. Skipping from report.
📢 Generating summary...
Processing... done!
📢 Posting PR review...
...LLM Response
```

---

### `new`
**Description:**
Creates a new project based on an idea prompt. Builds on top of existing project scaffolders, so it only generates the React components, not the supporting files such as `package.json` or other configuration files.

Currently, the only project option to create is `react-tsx`, which generates React TSX components, including App.tsx.

This feature should be considered experimental, as it is more complicated than some of the other features of ZapCircle. In addition, you may need to hand edit some of the generated files to fix minor errors, even with the addition of the validation step.

**Usage:**
```bash
npx zapcircle new react-tsx .
```

**Options**
- `--verbose`: Logs the LLM prompt and response to the console.

**Example:**
```bash
npx zapcircle new react-tsx .

**Output:**
```plaintext
Running ZapCircle New...
A project.zap.toml file already exists. Use it? (Y/n): n
What are you building? A database to keep track of the dogs I walk, along with how many miles each one has gone for the month for my doggy walking business.
Processing... done!
📄 Overwrote /Users/jefflinwood/Projects/zc-examples/zc-new/project.zap.toml
Processing... done!
🧩 Wrote App.tsx
🧩 Wrote DogList.tsx
🧩 Wrote DogDetails.tsx
🧩 Wrote AddDogForm.tsx
🧩 Wrote StatsOverview.tsx
✅ All components and App.tsx generated successfully.
🧪 Running TypeScript check...
✅ TypeScript check passed with no compile-time errors.
🔍 Sending source code to LLM for validation...
Processing... done!

🧠 LLM Validation Report:

Everything seems fine with the implementation. All prop names being passed between components match correctly, state handling is logical, and the components are structured in a maintainable way. The code should work as intended without any modifications.
✅ No fixes returned. Project looks good.
✅ Project scaffolding complete!
👉 You can now run your app or customize App.tsx and the components.
```

---

### `configure`
**Description:**  
Interactively set up ZapCircle by selecting a preferred LLM (e.g., OpenAI) and providing configuration parameters like the OpenAI API key and model names.

**Usage:**
```bash
npx zapcircle configure
```

**Prompts:**
- Preferred LLM (default: `openai`).
- Large model name (default: `gpt-4`).
- Small model name (default: `gpt-3.5-turbo`).
- OpenAI API key.

**Example:**
```bash
npx zapcircle configure
```

**Output:**
```plaintext
Configuring ZapCircle CLI...

Preferred LLM (openai): openai
OpenAI large model (default: o1): o1
OpenAI small model (default: o1-mini): o1-mini
OpenAI API key: ********

Configuration saved to ~/.zapcircle/zapcircle.cli.toml
```

---

### `init`
**Description:**  
Initialize a new ZapCircle project by creating a `zapcircle.config.toml` file in the current directory.

**Usage:**
```bash
npx zapcircle init
```

**Output:**  
Creates a `zapcircle.config.toml` file with default settings.

**Example:**
```bash
npx zapcircle init
```

**Generated File:**
```toml
# ZapCircle Project Configuration
[prompts]
all = ""
analyze = ""
generate = ""

[filetype.generate]
```

**Output:**
```plaintext
Initializing new ZapCircle project...
ZapCircle project initialized. Configuration file created at ./zapcircle.config.toml
```

---

### `status`
**Description:**  
Display the current ZapCircle configuration, including:
- The user's preferred LLM.
- Whether a project configuration file is present.
- Detailed settings for the project.

**Usage:**
```bash
npx zapcircle status
```

**Example:**
```bash
npx zapcircle status
```

**Output:**
```plaintext
ZapCircle Configuration Status:

User Configuration:
  Preferred LLM: openai
  Large Model: o1
  Small Model: o1-mini
  OpenAI API Key: Configured

Project Configuration: Found
  Prompt Settings:
    All Prompts: Custom instruction
    Analyze Prompts: Analyze-specific instruction
    Generate Prompts: Generate-specific instruction
  Filetype Generate Prompts:
    jsx: JSX-specific instruction

Status check complete.
```

---
## Global Options

### `--version`
**Description:**  
Display the current version of the ZapCircle CLI.

**Usage:**
```bash
npx zapcircle --version
```

**Example:**
```bash
npx zapcircle --version
```
**Output:**
```plaintext
1.0.0
```

### `--help`
**Description:**  
Display help information for the CLI or any specific command.

**Usage:**
```bash
npx zapcircle --help
```
For command-specific help:
```bash
npx zapcircle <command> --help
```

**Example:**
```bash
npx zapcircle analyze --help
```
**Output:**
```plaintext
Usage: zapcircle analyze <filetype> <path>

Analyze the provided file or directory for <filetype> - such as jsx

Options:
  -h, --help  display help for command
```

---

## Notes
- Ensure that the ZapCircle CLI is installed globally or is accessible from your project directory.
- Use clear paths and filetype names to avoid errors.


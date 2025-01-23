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

**Example:**
```bash
npx zapcircle generate jsx ./behaviors/LoginForm.zap.toml
```
**Output:**
```plaintext
Generating "jsx" from "./behaviors/LoginForm.zap.toml"...
```

---

### `generateTests`
**Description:**  
Generate test files based on a `.zap.toml` behavior specification.

**Usage:**
```bash
npx zapcircle generateTests <filetype> <pathToToml>
```

**Arguments:**
- `<filetype>`: The type of test file to generate (e.g., `jsx`, `ts`).
- `<pathToToml>`: The path to the `.zap.toml` file defining the behavior.

**Example:**
```bash
npx zapcircle generateTests ts ./behaviors/LoginForm.zap.toml
```
**Output:**
```plaintext
Generating tests "ts" from "./behaviors/LoginForm.zap.toml"...
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


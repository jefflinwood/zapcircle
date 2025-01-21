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


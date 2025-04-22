---
title: Customizing ZapCircle Prompts
description: Learn how to override and create your own prompt templates in ZapCircle using the .zapcircle directory
---

ZapCircle ships with a built-in prompt library — but did you know you can override or extend it with your own prompts? For instance, you can support Vue components, or write Python code with ZapCircle. 

This guide explains how the prompt system works and how to customize it with your own templates.

---

## How the Prompt Loader Works

When you run a ZapCircle command like:

```bash
npx zapcircle generate jsx ./MyComponent.zap.toml
```

ZapCircle does the following behind the scenes:

1. Looks for a matching prompt file in your project:
   ```
   .zapcircle/prompts/generate/jsx.txt
   ```
2. If it doesn’t exist, falls back to the built-in default prompt, which gets bundled in the zapcircle command, but you can see in the source code on GitHub:
   ```
   zapcircle/src/prompts/generate/jsx.txt
   ```
3. Loads any extra prompt variables from:
   ```
   zapcircle.config.toml
   ```
4. Interpolates `${...}` placeholders in the prompt file with values from your behavior TOML file and the config.

---

## Prompt Folder Structure

To override or add your own prompts, use a folder structure similar to this inside your project:

```
.zapcircle/
└── prompts/
    ├── generate/
    │   ├── jsx.txt
    │   └── tsx.txt
    └── analyze/
        └── jsx.txt
```

Each file should be a `.txt` template with variable placeholders like `${behavior}`, `${name}`, etc.

---

## Example: Custom JSX Prompt

Create a file inside your project in a `.zapcircle` directory:

```
.zapcircle/prompts/generate/jsx.txt
```

With contents like:

```
You are a helpful assistant writing React components.

Component name: ${name}
Component behavior:
${behavior}

Generate a functional JSX component with comments and minimal dependencies.
```

Now this will be used *instead* of ZapCircle's default prompt when generating JSX.

---

## Prompt Variables

You can use these variables in your prompt templates:

- `${name}` – from your `.zap.toml` file
- `${behavior}` – the main behavior block
- `${global_prompt}` – optional global string from `zapcircle.config.toml`
- `${generate_prompt}` – type-specific string from config (e.g., only for generate)

These are merged from both:
- Your `.zap.toml` file
- `zapcircle.config.toml`

---

## Advanced: Add Defaults in `zapcircle.config.toml`

```toml
[prompts]
all = "Always write clean, readable code."
generate = "Use Tailwind CSS and follow accessibility best practices."
```

These values become `${global_prompt}` and `${generate_prompt}` inside your prompt templates.

---

## Wrap-Up

This system gives you total control over what prompts ZapCircle sends to the LLM. Customize prompts to match your team’s tone, conventions, or coding style — all without forking or modifying the core ZapCircle repository.

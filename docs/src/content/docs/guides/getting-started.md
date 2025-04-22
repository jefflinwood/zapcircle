---
title: Getting Started with ZapCircle
description: Set up ZapCircle with your code base to get started with behavior-driven development
---

This guide walks you through the basics of adding ZapCircle to your React-based web development project.

# Important to Know

ZapCircle is a developer tool that **does not modify your production build or run-time code**. It generates code based on your written behaviors and allows you to review, modify, and test it before adding it to source control.

ZapCircle works with any React framework, including **Next.js**, **Remix**, **Vite**, and others. It does not require changes to your application architecture.

ZapCircle supports multiple LLM providers via [LangChain](https://www.langchain.com/). As of now, the following providers are supported:

- ✅ OpenAI
- ✅ Anthropic
- ✅ Google (Gemini)
- ✅ Local LLMs (via REST API, such as LM Studio or Ollama)

> ⚠️ Each provider requires its own API key or URL. See below for configuration.

---

# Prerequisites

To get started with ZapCircle, you'll need:

- A React project with components in `.jsx` or `.tsx` format
- One or more API keys or endpoints for supported LLM providers (OpenAI, Anthropic, etc.)

---

## Setting Up ZapCircle

### Step 1: Verify Installation

You don’t need to install ZapCircle globally. Instead, use `npx` to run the CLI directly:

```bash
npx zapcircle --version
```

If installed correctly, this will print the current version of ZapCircle.

---

### Step 2: Configure ZapCircle

Run the configuration wizard:

```bash
npx zapcircle configure
```

You’ll be prompted to set:

- Your **preferred LLM provider** (e.g., `openai`, `anthropic`, `google`, or `local`)
- Your preferred **large** and **small** model names
- API keys for any provider you'd like to use
- (Optional) A base URL for a locally running LLM

#### Example output:

```plaintext
🛠️ Configuring ZapCircle CLI...

Preferred Provider (openai): openai
Large model (default: gpt-4o): gpt-4o
Small model (default: gpt-4o-mini): gpt-4o-mini

🔑 Enter API keys for the providers you want to use.
OpenAI API key (optional): sk-***********
Anthropic API key (optional): 
Google API key (optional): 
Local LLM base URL (optional): http://localhost:1234

✅ Configuration saved to ~/.zapcircle/zapcircle.cli.toml
```

Your configuration is stored in a TOML file at:

```bash
~/.zapcircle/zapcircle.cli.toml
```

---

### Step 3: Confirm Your Setup

Run the following command to confirm everything is correctly configured:

```bash
npx zapcircle status
```

This will show:

- The configured provider
- Model names for large and small tasks
- API key status for each provider
- Local LLM settings (if applicable)
- Whether a project-level config file is present

#### Example Output:

```plaintext
📦 ZapCircle Configuration Status:

🔧 User Configuration:
  Provider: openai
  Large Model: gpt-4o
  Small Model: gpt-4o-mini
  API Keys:
    OpenAI: ✅ Configured
    Anthropic: ❌ Not Configured
    Google: ❌ Not Configured
    Local LLM: ✅ Configured (http://localhost:1234)

📁 Project Configuration: ❌ Not Found

✅ Status check complete.
```

---

# Next Step

Now that ZapCircle is ready to use, you're just a few steps away from using behavior-driven development in your React project.

➡️ [Continue to Create Behaviors](/guides/create-behaviors)

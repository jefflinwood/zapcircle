---
title: Getting Started with ZapCircle
description: Set up ZapCircle with your code base to get started with behavior-driven development
---

This guide walks you through the basics of adding ZapCircle to your React-based web development project.

# Important to know

ZapCircle is a developer tool, and does not modify your production build or generate code at run time. You can review, modify, and test any generated code before adding it to source control - just like any other tool.

The ZapCircle tool also works with any React framework - such as Next or Remix/React Router - and does not require any changes or upgrades.

The current version of ZapCircle works with the [Open AI API](https://platform.openai.com/docs/overview), using your own API key. Please be aware of any privacy, security, or cost concerns associated with using this API with your code base.

# Prerequisites

To get started with ZapCircle, you'll need two things:
* Your code, or an example project, with React components in either JSX or TSX format. This could be Next, React Router/Remix, or something else.
* An OpenAI API Key - [Create an API Key here](https://platform.openai.com/api-keys)


## Setting up ZapCircle

### Step 1: Verify Installation

You typically don't need to install ZapCircle as a development dependency in your project. Run the following command to check the CLI version:

```bash
npx zapcircle --version
```

You should see the version of ZapCircle appear in the command line output, confirming the CLI is installed and ready to use.

---

### Step 2: Configure ZapCircle

Run the following command to interactively set up your preferred LLM and API key:

```bash
npx zapcircle configure
```

You'll be prompted to provide:

1. Your preferred LLM (default: `openai`) - note, this is the only LLM supported with the current version.
2. The large model name (default: `o1`).
3. The small model name (default: `o1-mini`).
4. Your LLM API key (if applicable).

Example output:

```plaintext
Configuring ZapCircle CLI...

Preferred LLM (openai): openai
OpenAI large model (default: o1): o1
OpenAI small model (default: o1-mini): o1-mini
OpenAI API key: ********

Configuration saved to ~/.zapcircle/zapcircle.cli.toml
```

---

### Step 3: Confirm Your Setup

After configuring ZapCircle, you can confirm everything is set up correctly by running:

```bash
npx zapcircle status
```

This command will display:

- The preferred LLM configured for your user.
- Whether a project-specific configuration file (`zapcircle.config.toml`) exists.
- Detailed settings for the user and project configuration.

Example output:

```plaintext
ZapCircle Configuration Status:

User Configuration:
  Preferred LLM: openai
  Large Model: o1
  Small Model: o1-mini
  OpenAI API Key: Configured

Project Configuration: Not Found
```

---

# Next step

Now that you have ZapCircle setup for your project, you can start to use it as a development assistant.

Let's learn how to [create behaviors](/guides/create-behaviors) for an existing project in the next step of the tutorial.
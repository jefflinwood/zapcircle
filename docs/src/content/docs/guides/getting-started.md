---
title: Getting Started with ZapCircle
description: Set up ZapCircle with your code base to get started with behavior-driven development
---

This guide walks you through the basics of adding ZapCircle to your React-based web development project.

At the end of the guide, you'll have human-readable behaviors for all of your React components (JSX or TSX). You'll also have created a new component directly from a behavior prompt, and generated unit tests for that component. We'll then take things a step further and modify how that component works with the ZapCircle Studio.

# Important to know

ZapCircle is a developer tool, and does not modify your production build or generate code at run time. You can review, modify, and test any generated code before adding it to source control - just like any other tool.

The ZapCircle tool also works with any React framework - such as Next or Remix/React Router - and does not require any changes or upgrades.

The current version of ZapCircle works with the [Open AI API](https://platform.openai.com/docs/overview), using your own API key. Please be aware of any privacy, security, or cost concerns associated with using this API with your code base.

# Prerequisites

To get started with ZapCircle, you'll need two things:
* A React code base
* An OpenAI API Key - [Create an API Key here](https://platform.openai.com/api-keys)

Once you have the API Key, add it to your local .env file as:

```
OPENAI_API_KEY=sk-proj-XXXYYYZZZZ000011112222333
```

Or set it as an environment variable. You do not need this API key in your production environment.

# Installing the ZapCircle command line tool

Add the `@zapcircle/cli` command line tool to your project's developer dependencies with the following command:

```bash
npm install --dev @zapcircle/cli
```

This will give you access to the `npx zapcircle` command.

# Creating the zapcircle.config.toml configuration file

Once you have the command line tools setup, you can create a `zapcircle.config.toml` file for your current project.

The easiest approach is to use the `npx zapcircle init` command:

```bash
npx zapcircle init
```

You'll get a new `zapcircle.config.toml` file, which you can then customize:

```toml
[prompts]
additionalInstructions=
```

Here, you could include suggestions for your code base, such as always use TypeScript, use Tailwind, or use Jest for testing.

# Next step

Now that you have ZapCircle setup for your project, you can start to use it as a development assistant.

Let's learn how to [create behaviors](/guides/create-behaviors) for an existing project in the next step of the tutorial.
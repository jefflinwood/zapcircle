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

Once you have the API Key, add it to your local .env file as:

```
OPENAI_API_KEY=sk-proj-XXXYYYZZZZ000011112222333
```

Or set it as an environment variable. You do not need this API key in your production environment.

# Using the ZapCircle command line tool

You typically don't need to install ZapCircle as a development dependency in your project.

Run the tool with the `npx zapcircle` command.

```bash
npx zapcircle --version
```

You should see the version of ZapCircle appear in the command line output.

# Next step

Now that you have ZapCircle setup for your project, you can start to use it as a development assistant.

Let's learn how to [create behaviors](/guides/create-behaviors) for an existing project in the next step of the tutorial.
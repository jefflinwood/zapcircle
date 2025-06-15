---
title: Working with ZapCircle Agent
description: Describes the core agent workflow for npx zapcircle agent and its sub-commands.
---

Working with ZapCircle Agent, you collaborate with the LLM of your choice to plan changes and make edits to your codebase.

The agent runs fully on your computer - only communicating with the LLM API of your choice - including a local option if you prefer.

When you run ZapCircle's Agent, you have the choice of letting it autonomously try and solve issues, or working with as a pair programmer.

---

## Core Agent Workflow

ZapCircle Agent provides 4 main commands:

| Command | Purpose |
|---------|---------|
| `agent chat` | Create a new issue |
| `agent run` | Run an agent task on an existing issue |
| `agent pair` | Full pair programming loop with plan + behaviors |
| `agent status` | View open agent issues |

---

## Create Issues with `agent chat`

Start by describing the problem you want ZapCircle to work on:

```bash
npx zapcircle agent chat
```

The agent will ask:

> What's the problem you'd like help with?

Example:

```bash
Add a Remember Me checkbox to the LoginForm so users can stay logged in.
```

ZapCircle will:

- Convert your request into a structured issue
- Store it as a TOML file inside `.zapcircle/agent/issues/`
- Queue it for agent processing

---

## View Open Issues with `agent status`

You can see your issue backlog anytime:

```bash
npx zapcircle agent status
```

Example output:

```
📋 Current Issues

1) Add Remember Me checkbox (medium) [🆕 new]
2) Update Profile Form validation (high) [✅ done]
3) Add password strength meter (low) [🆕 new]
```

These issues are not synced with any other issue trackers (JIRA, Linear, GitHub Issues) yet, but this functionality is on the road map.

---

## Run Agent with `agent run`

You can let ZapCircle attempt to fix an issue directly:

```bash
npx zapcircle agent run
```

- You'll pick which issue to run.
- ZapCircle will attempt to generate code and review it.
- This mode works best for small, incremental tasks.
- ZapCircle will send the issue through a code review loop

---

## Full Pair Programming with `agent pair`

This is the full agent workflow with you as the programmer in the loop:

```bash
npx zapcircle agent pair
```

In pair mode, ZapCircle will:

* Read the issue  
* Propose a detailed implementation plan  
* Ask you to approve or edit the plan  
* Update behavior files with your approval  
* Generate or update code based on behaviors  
* Review the code with an LLM (`zapcircle review`)
* Show you full diffs before writing files  
* Learn your coding style preferences

With pair mode, you remain fully in control at every step. 

---

## Safety Features

- Every file change shows a diff before being written.
- Backups are made automatically before overwriting files.
- You can undo any change.
- Style preferences are suggested as you work.

---

## Where issues are stored

All agent issues live in the project as:

```bash
.zapcircle/agent/issues/
```

Each issue is stored as a simple TOML file that can be easily edited or version controlled.

---

## Example Issue

Here is an example issue file, showing that the source was the `agent chat` interface.

```toml
id = 41
source = "chat"
status = "pending"
priority = "High"
title = "Fix login redirect after successful auth"
description = """
Users are not being redirected after logging in.
The LoginForm component should redirect to /dashboard on success.
"""
createdAt = "2025-05-13T13:00:00Z"
author = "jeff.linwood"

[[comments]]
author = "jeff.linwood"
createdAt = "2025-05-13T13:01:00Z"
body = "Seems related to LoginForm.jsx"

[[comments]]
author = "alex.smith"
createdAt = "2025-05-13T13:02:00Z"
body = "Possibly missing useNavigate hook?"
```

There are a lot of interesting ideas that could be applied here in the future, so reach out if you are interested in improving how the agent issue store works.

## Coming Soon/Roadmap

- Bi-directional sync with issue management applications
- Multi-file coordinated edits
- Agent job queue automation
- Behavior drift detection
- Orchestration layer for larger projects

---

## Conclusion

ZapCircle Agent works entirely on your local machine, except for the LLM integration.

Use the `pair` feature to safely modify your codebase, or turn it loose on small issues with `run`.

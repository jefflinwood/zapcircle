---
title: ZapCircle Behavior File Specification
description: What does and does not go into a ZapCircle Behavior File
---

ZapCircle uses **behavior files** (`.zap.toml` extension) to describe the intent of the source code in your application.

These are not meant to be all-inclusive, one-for-one representations of the underlying code - they are meant to be human-readable, easy to understand, and a common language across different systems.

Within ZapCircle, behavior files power:
* Code generation and updates
* Agent functionality
* New project creation
* Diagrams and user journeys
* Test generation

## Basic format

Only `name` and `behavior` are required as of ZapCircle 0.2.5.

```toml
name = "ComponentName"
role = "What this source code file does - short description"
behavior = """
Explain the behavior in two or three sentences.
Focus on what happens from the user or system's perspective.
"""
```

## Optional fields

You can also add optional fields to the behavior, such as `path`, `auth`, or `sideEffects`. As ZapCircle functionality expands, these will become more useful to help with journey inference, test generation, or validation:


**path** - URL route where this component is visible (front end) or available (back end) (e.g. /signup)

**auth** - Access level required: public, user, or admin (or other)

**sideEffects** - List of DB, queue, or external actions this behavior triggers (back end)

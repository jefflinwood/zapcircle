---
title: Creating a New Project with ZapCircle
description: Use ZapCircle to go from an idea prompt to a full React codebase with a data model, design, and human-readable behaviors
---

When you start a project from scratch, or you just want to see how you might build something, the `zapcircle new` command lets you take a single prompt and turn it into a working React application.

You'll have your React components as TSX files, a `project.zap.toml` file that describes how data flows within the application, and `.zap.toml` behavior files you can adjust as necessary to get the requirements for your application.

## Creating your React Project

Start things out by creating a new React project, for instance with vite:

```bash
npm create vite@latest
```

Choose React + TypeScript. If you're using Tailwind, install Tailwind according to their directions.

ZapCircle does not do all of this for you - it builds on top of existing solutions.

## Generating an Application with ZapCircle

Once you have ZapCircle [set up](./getting-started), you can create a new React application by running:

```bash
npx zapcircle new react-tsx my-app-directory "A calming mood tracker with soft colors and a centered layout"
```

If you omit the description, ZapCircle will prompt you interactively for your idea.

Here's an example output:

```bash
Running ZapCircle New...
What are you building? A soothing mindfulness application that lets me keep track of my moods through the day
Processing... done!
📄 Created /Users/jefflinwood/Projects/zc-examples/zc-example/project.zap.toml
📁 Created src/components directory
📝 Created: /Users/jefflinwood/Projects/zc-examples/zc-example/src/components/MoodLogger.tsx.zap.toml
📝 Created: /Users/jefflinwood/Projects/zc-examples/zc-example/src/components/MoodVisualizer.tsx.zap.toml
📝 Created: /Users/jefflinwood/Projects/zc-examples/zc-example/src/components/MoodSelector.tsx.zap.toml
✅ Behavior files created:
MoodLogger.tsx.zap.toml
MoodVisualizer.tsx.zap.toml
MoodSelector.tsx.zap.toml
Processing... done!
🧩 Wrote App.tsx
🧩 Wrote MoodLogger.tsx
🧩 Wrote MoodVisualizer.tsx
🧩 Wrote MoodSelector.tsx
✅ All components and App.tsx generated successfully.
🧪 Running TypeScript check...
✅ TypeScript check passed with no compile-time errors.
🔍 Sending source code to LLM for validation...
Processing... done!

🧠 LLM Validation Report:

Everything is fine. The props are passed correctly, state is handled and shared logically, components are structured in a maintainable and valid way, and the names of all variables passed between components match appropriately.
✅ No fixes returned. Project looks good.
✅ Project scaffolding complete!
👉 You can now run your app or customize App.tsx and the components.
```

Your output will differ based on your project - and due to the nature of LLM-driven development - it can be different every time you run it.

## New Project Generation Process

After running `zapcircle new`, ZapCircle will:
	1.	Generate a `project.zap.toml` file based on your idea
	2.	Scaffold `.zap.toml` behavior files for each component from the 
	3.	Use one-shot LLM code generation to:
	•	Create each component file (e.g. `MoodList.tsx`, `MoodEntryForm.tsx`)
	•	Generate a complete `App.tsx` that wires everything together
	4.  Validate the codebase with TypeScript
	5.	Fix issues using a single round of LLM-based validation

After the command completes, you’ll have a ready-to-run React app in the folder you specified.

## The `project.zap.toml` File

Here is an example of a generated `project.zap.toml` file from `zapcircle new`:

```toml
name = "MindfulMoodTracker"
description = "A soothing mindfulness application for tracking and visualizing moods throughout the day."

[layout]
structure = "SPA"
framework = "React"
cssFramework = "Tailwind"

[state]
sharedStates = [
  { name = "moodEntries", type = "Array<Object>", description = "A list of mood entries recorded by the user" },
  { name = "selectedMood", type = "String", description = "Currently selected mood for a new entry" }
]

[[components]]
name = "MoodLogger"
role = "Logs mood entries from the user"
inputs = ["selectedMood"]
behavior = "Displays mood options and allows the user to add a new mood entry"
providesState = ["moodEntries"]

[[components]]
name = "MoodVisualizer"
role = "Visualizes mood entries over time"
inputs = ["moodEntries"]
behavior = "Renders a graphical representation of mood entries to provide insights"

[[components]]
name = "MoodSelector"
role = "Selects a mood for logging"
inputs = []
behavior = "Presents mood options and allows the user to select one to log"

[[data]]
name = "MockMoodData"
shape = "Array<Object>"
fields = ["date", "mood", "note"]
description = "Mock data for mood entries used for testing"

[interaction]
stateFlow = "MoodLogger uses selectedMood to update moodEntries. MoodVisualizer receives moodEntries. MoodSelector updates selectedMood."
propsFlow = "selectedMood passed from MoodSelector to MoodLogger. moodEntries passed to MoodVisualizer."
contextUsage = false

[build]
componentsDirectory = "./src/components"

[design]
userInterfaceTheme = "Soothing and calming"
primaryColor = "#4A90E2"
secondaryColor = "#50E3C2"
fontFamily = "Quicksand, sans-serif"
```

This project file gets used to create the individual behavior files, as well as to generate the source code.

## Design-aware Generation

If your project prompt includes visual style preferences (e.g. calming, playful, rounded buttons, use Inter font, etc.), ZapCircle will generate a [design] section in the TOML file:

```toml
[design]
theme = "calming"
primaryColor = "#A8DADC"
secondaryColor = "#457B9D"
fontFamily = "Inter, sans-serif"
borderRadius = "rounded-xl"
```

These preferences are incorporated into the generated Tailwind components, giving your project a personal touch from the beginning.

## Example Project

Here’s a prompt you can try:

```bash
npx zapcircle new mood-tracker "I'm building a mood tracker app that lets users log how they're feeling each day. I'd like a calming visual style, with soft blue and green colors, and a rounded look. The layout should be centered and minimalist."
```

This will produce:

* A project.zap.toml with all layout, state, and design metadata
* Component behaviors like MoodEntryForm, MoodList, and MoodSummary
* A functional React app scaffolded and styled according to your prompt

## What’s Next?

After your project is scaffolded, you can:
*	Customize the generated behavior files and re-generate source code individually with `zapcircle generate`
*	Add new components and write `.zap.toml` behavior files manually
*	Use `zapcircle analyze` to extract behaviors from existing code
*	Use `zapcircle validate` to check correctness or apply improvement

To learn how to go from behaviors to custom components, check out the [Generating Code](./generating-code) guide.
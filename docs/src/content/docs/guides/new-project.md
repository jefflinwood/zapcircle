---
title: Creating a New Project with ZapCircle
description: Use ZapCircle to go from an idea prompt to a full React + React Router + Tailwind codebase with human-readable behaviors
---

Whether you’re starting a new project from scratch or exploring an idea, the `npx zapcircle new` command lets you take a single prompt and turn it into a working React application.

You'll get:

* A full Vite + React + TypeScript project scaffold
* Tailwind CSS preconfigured
* React Router installed and routes set up

* A `project.zap.toml` file describing your layout, state, and component design
* Individual `.zap.toml` behavior files for each component
* Human-readable, editable behaviors

* Automatically generated React TSX components
* A validation pass over the generated project to fix any errors


## Generating an Application with ZapCircle

Once you have ZapCircle [configured](./getting-started), you can create a new React application by running:

```bash
npx zapcircle new react-tsx my-app-directory "A calming mood tracker with soft colors and a centered layout"
```

If you omit the description, ZapCircle will prompt you interactively for your idea. 

The project type is required for now — just use `react-tsx`.

The next argument is the directory where you want the project - this should be empty, or not created yet.

Here's an example output:

```bash
💡 Let's define your new project
What are you building? A soothing mindfulness application that lets me keep track of my moods through the day
📦 Creating base Vite + React + TS project at ./mindful-moods...
📄 Created project.zap.toml
🧠 Here's your generated project.zap.toml:
  1 | name = "MindfulMoodTracker"
  2 | description = "A soothing mindfulness application..."
... (more lines)
✏️  Press Enter to continue once you've reviewed or edited the project.zap.toml
🔍 Scaffolding behaviors...
🧠 Example behavior file: MoodLogger.tsx.zap.toml
  1 | name = "MoodLogger"
  2 | role = "Logs mood entries from the user"
... (more lines)
✏️  Press Enter to continue once you've reviewed or edited this behavior file
⚙️ Generating components...
🧪 Running TypeScript check...
✅ TypeScript check passed
🔍 LLM Validation: Everything looks good
✅ Project scaffolding complete!
👉 Next steps:
   - Run the dev server: `npm run dev`
   - Edit components in `src/`
   - Modify behavior files and run: `npx zapcircle generate`
   - Get AI-assisted feedback with: `npx zapcircle review`
```

Your output will differ based on your project - and due to the nature of LLM-driven development - it can be different every time you run it.

## Example Prompt

```bash
npx zapcircle new mood-tracker "I'm building a mood tracker app that lets users log how they're feeling each day. I'd like a calming visual style, with soft blue and green colors, and a rounded look. The layout should be centered and minimalist."
```

This will produce:

* A layout defined in `project.zap.toml`
* Three to five components with behaviors
* Editable behavior files
* A functional, stylized React + Tailwind + Router app

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

## What’s Next?

After your project is scaffolded, you can:
*	Edit any of the `.zap.toml` behavior files and re-run `npx zapcircle generate` to update the code
*	Add new components and write `.zap.toml` behavior files manually
*	Use `npx zapcircle analyze` to extract behaviors from existing code
*	Run `npx zapcircle review` for an AI-powered code review before opening your pull request

To learn how to go from behaviors to custom components, check out the [Generating Code](./generating-code) guide.
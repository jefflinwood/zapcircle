---
title: Creating Behaviors with ZapCircle
description: Analyze your existing code base to identify acceptance criteria, edge cases, and unit tests
---

Once you have [ZapCircle set up](./getting-started), you can analyze your existing code base and create human-readable behaviors for each of your React components.

## Generating behaviors

To analyze your code base, run:

```bash
npx zapcircle analyze jsx .
```

ZapCircle will find each JSX React component in the directory that you specify, and then process that component.

## Example behavior

The results are put into a `ComponentName.jsx.zap.toml` file in the same directory as the `.jsx` or `.tsx` file. If you open a `.zap.toml` file, you will see something similar to this:

```toml
name = "counter"
behavior = """

- **Functionality**: The `Counter` component allows users to increment and decrement a numeric count displayed in the UI. 
- **Initial State**: The count starts at `0`.
- **User Interaction**: Users can interact with the component by clicking the "+" and "-" buttons to change the count.
- **Reactivity**: The component re-renders each time the state is updated, showing the current count value in the `<h1>` element.
- **Potential Improvement**: To handle rapid state updates correctly, the `setCount` function should be used in a way that considers the previous state.

Overall, the `Counter` component is a straightforward implementation of a counter, demonstrating basic React state management and event handling principles."""
edgeCases = """
When analyzing the provided React component, `Counter`, various edge cases can be identified that should be tested to ensure the component behaves correctly under different conditions. Here are some potential edge cases to consider:

1. **Initial State**:
   - Test that the initial count is `0` when the component is first rendered.

2. **Incrementing Count**:
   - Test that clicking the "+" button increments the count correctly.
   - Test that multiple increments (e.g., clicking the "+" button multiple times in quick succession) updates the count accurately.

3. **Decrementing Count**:
   - Test that clicking the "-" button decrements the count correctly.
   - Test that multiple decrements (e.g., clicking the "-" button multiple times in quick succession) updates the count accurately.

4. **Handling Negative Counts**:
   - Test that the counter can go negative when decrementing from `0`. Ensure that the count displays `-1`, `-2`, etc.
"""
```

The way ZapCircle works is to combine your component code with a specific prompt and any additional prompt instructions for your project. That combined prompt goes to a specific LLM model (such as OpenAI's gpt-4o-mini), and the response goes into the `.zap.toml` file.

Results of multiple calls to the LLM go into one TOML file - however you do not have to run all analyses on all components with the same model type, if you want to optimize for cost or speed.

## Next step

While these TOML files can certainly be interesting to read through - you can get insights into what the code does quickly, the next step is to write your own code or components using this behavior-driven approach.

We'll do that in the [Generating Code](/guides/generating-code) guide.
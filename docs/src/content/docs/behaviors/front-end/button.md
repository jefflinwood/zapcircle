---
title: Button
description: Example Button Behavior
---

Use this behavior as a starting point for your own project.

```toml title=Button.zap.toml
name = "Button"
behavior = """
 # Button Behavior Specification

## Overview
The `Button` component is a reusable and versatile component used to perform user actions. It supports multiple variants (e.g., primary, secondary, disabled) and can display a loading spinner when performing an asynchronous action.

---

## Properties
- **Label**
  - **Type**: String
  - **Description**: The text displayed inside the button.
  - **Example**: "Submit"

- **Variant**
  - **Type**: String
  - **Description**: Determines the visual style of the button.
  - **Values**:
    - `primary`: For primary actions.
    - `secondary`: For less important actions.
    - `disabled`: For non-interactive states.

- **Loading**
  - **Type**: Boolean
  - **Description**: Indicates whether the button is performing an action.
  - **Behavior**: Displays a loading spinner and disables the button.

---

## UI States
- **Default State**
  - Display the button label.
  - Apply the appropriate styling based on the variant.

- **Disabled State**
  - Greyed-out appearance.
  - Button is non-interactive (no hover or click effects).

- **Loading State**
  - Replace the label with a spinner or include the spinner alongside the label.
  - Disable click interactions.

---

## Events
- **Click Event**
  - Triggered when the user clicks on the button.
  - Behavior:
    - Execute the assigned action or function.
    - Prevent multiple clicks if in a loading state.

---

## Accessibility
- Ensure the button is focusable and usable via keyboard navigation.
- Provide an accessible name using the `aria-label` or `aria-labelledby` attributes if the button has no visible text.
- Add `aria-busy="true"` during the loading state to indicate to assistive technologies that the button is performing an action.
- Use proper focus outlines for visibility during keyboard navigation.

---

## Behavior Examples
### Primary Button
- **Action**: Submit a form.
- **Appearance**: Blue background with white text.
- **Behavior**:
  - Trigger form validation on click.
  - Show a loading spinner while submitting.

### Secondary Button
- **Action**: Navigate to a different page.
- **Appearance**: Grey background with black text.
- **Behavior**:
  - Redirect to the assigned URL on click.
  - Provide hover and focus effects.

### Disabled Button
- **Action**: Non-interactive.
- **Appearance**: Greyed-out background with no hover effects.
- **Behavior**:
  - Ignore all clicks or keypresses.

---

## Testing
- **Unit Tests**:
  - Verify the button renders correctly with all variants.
  - Test the loading state to ensure the spinner is displayed and the button is disabled.
  - Ensure click events are fired only when the button is enabled.

- **Integration Tests**:
  - Simulate user interaction for different variants (clicks, focus, hover).
  - Validate accessibility attributes like `aria-busy` and focus outlines.
  - Test the button in combination with forms and other components.

"""
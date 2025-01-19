---
title: Modal Dialog
description: Example Modal Dialog Behavior
---

Use this behavior as a starting point for your own project.

```toml title=ModalDialog.zap.toml
name = "ModalDialog"
behavior = """
 # ModalDialog Behavior Specification

## Overview
The `ModalDialog` component is a reusable pop-up container used for displaying messages, forms, or confirmations. It includes accessible features such as keyboard navigation and the ability to close the modal by clicking outside or pressing the `Escape` key.

---

## Properties
- **Title**
  - **Type**: String
  - **Description**: The title text displayed at the top of the modal.
  - **Example**: "Are you sure?"

- **Content**
  - **Type**: String or JSX
  - **Description**: The content or body of the modal.

- **Actions**
  - **Type**: Array of Buttons
  - **Description**: A list of actions (e.g., "Cancel", "Confirm") displayed at the bottom of the modal.

- **Open**
  - **Type**: Boolean
  - **Description**: Determines whether the modal is visible.

---

## UI States
- **Default State**
  - Modal is hidden from view.
  - The background page is fully interactive.

- **Open State**
  - Display the modal overlay and content.
  - Disable interaction with the background page (focus trap).

- **Loading State** (Optional)
  - Show a loading spinner for actions that take time to complete.

---

## Accessibility
- Use a focus trap to keep the user’s focus within the modal while it is open.
- Add `aria-labelledby` to associate the modal title with the content.
- Add `aria-describedby` to associate detailed descriptions with the modal content.
- Use `aria-hidden="true"` to hide the modal from screen readers when closed.
- Close the modal when the user presses the `Escape` key.

---

## Behavior
- **Open Modal**
  - Triggered by clicking a button or link designated to open the modal.
  - Focus moves to the first focusable element inside the modal.

- **Close Modal**
  - Triggered by:
    - Clicking the close button.
    - Clicking outside the modal.
    - Pressing the `Escape` key.
  - Focus returns to the element that triggered the modal.

- **Overlay Click**
  - Clicking outside the modal content closes the modal unless explicitly disabled.

- **Action Buttons**
  - Executes the specified function (e.g., confirmation, cancellation) when clicked.
  - Supports a disabled state during processing (e.g., "Confirm" button becomes disabled while saving).

---

## Events
- **onOpen**
  - Callback triggered when the modal opens.

- **onClose**
  - Callback triggered when the modal closes.

- **onAction**
  - Callback triggered when an action button is clicked.

---

## Testing
- **Unit Tests**:
  - Verify the modal opens and closes correctly.
  - Ensure focus trapping works while the modal is open.
  - Test behavior for all close triggers (button, overlay, `Escape` key).

- **Integration Tests**:
  - Simulate user interaction to verify accessibility features.
  - Test modal behavior with dynamic content or actions.
  - Ensure correct handling of nested modals (if supported).

"""
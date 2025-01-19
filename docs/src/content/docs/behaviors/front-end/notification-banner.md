---
title: Notification Banner
description: Example Notification Banner Behavior
---

Use this behavior as a starting point for your own project.

```toml title=NotificationBanner.zap.toml
name = "NotificationBanner"
behavior = """
 # NotificationBanner Behavior Specification

## Overview
The `NotificationBanner` component is used to display alerts, success messages, warnings, or error notifications. It supports auto-dismiss functionality, manual dismissal, and visual styles based on the notification type.

---

## Properties
- **Message**
  - **Type**: String
  - **Description**: The text displayed in the notification.
  - **Example**: "Your changes have been saved successfully."

- **Type**
  - **Type**: String
  - **Description**: Determines the style of the notification.
  - **Values**:
    - `success`: For success messages (e.g., "Operation completed successfully").
    - `error`: For error messages (e.g., "Something went wrong").
    - `warning`: For warnings (e.g., "Your subscription is about to expire").
    - `info`: For general informational messages.

- **Duration**
  - **Type**: Number
  - **Description**: The duration (in milliseconds) for which the banner is displayed before auto-dismissing.
  - **Default**: 5000 (5 seconds)

- **Dismissible**
  - **Type**: Boolean
  - **Description**: Determines if the notification can be dismissed manually by the user.
  - **Default**: `true`

---

## UI States
- **Visible State**
  - Display the notification banner with the appropriate style and message.
  - Optionally show a close button if `dismissible` is true.

- **Hidden State**
  - Notification is removed from view after the `duration` expires or the user dismisses it manually.

---

## Accessibility
- Use `role="alert"` for `error` and `warning` types to ensure screen readers announce them immediately.
- Use `aria-live="polite"` for `info` and `success` types to notify users in a non-disruptive way.
- Add a focusable close button if `dismissible` is true, with `aria-label="Close notification"`.

---

## Behavior
- **Show Notification**
  - Triggered programmatically or by a user action (e.g., form submission).
  - Display the notification at the top of the page or a designated container.

- **Auto-Dismiss**
  - Automatically hide the notification after the `duration` expires.
  - Reset the timer if the user interacts with the banner (e.g., hover or focus).

- **Manual Dismiss**
  - Remove the banner when the close button is clicked.
  - Optionally trigger a callback on dismissal.

---

## Events
- **onShow**
  - Callback triggered when the notification is displayed.

- **onDismiss**
  - Callback triggered when the notification is dismissed (either manually or automatically).

---

## Testing
- **Unit Tests**:
  - Verify the banner renders correctly for all types (`success`, `error`, `warning`, `info`).
  - Test the `duration` behavior to ensure auto-dismiss works as expected.
  - Ensure the close button dismisses the banner when clicked.

- **Integration Tests**:
  - Simulate user interactions (e.g., hovering over the banner) to test pause and resume behavior for auto-dismiss.
  - Validate accessibility attributes and screen reader announcements.
  - Ensure the notification works in combination with other UI components (e.g., form submissions).
"""
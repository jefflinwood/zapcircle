---
title: Login Form
description: Example Login Form Behavior
---

Use this behavior as a starting point for your own project.

```toml title=LoginForm.zap.toml
name = "LoginForm"
behavior = """
  # LoginForm Behavior Specification

  ## Overview
  The `LoginForm` component collects user credentials (email and password) and submits them to the `/login` API endpoint. It displays error messages for invalid inputs and server-side errors and redirects to a dashboard upon successful login.

  ## Input Fields
  - **Email Field**
    - Type: Email
    - Placeholder: "Enter your email"
    - Validations:
      - Required: "Email is required"
      - Format: "Please enter a valid email address"

  - **Password Field**
    - Type: Password
    - Placeholder: "Enter your password"
    - Validations:
      - Required: "Password is required"
      - Minimum Length: 8 characters

  ## Buttons
  - **Login Button**
    - Label: "Login"
    - Disabled State:
      - Disabled if either email or password is invalid.

  ## API Integration
  - **POST /login**
    - Payload:
      ```json
      {
        "email": "user@example.com",
        "password": "password123"
      }
      ```
    - Success Response:
      - HTTP Status: 200
      - Action: Redirect to `/dashboard`
    - Error Response:
      - HTTP Status: 401
      - Action: Display "Invalid email or password."
      - HTTP Status: 500
      - Action: Display "Something went wrong. Please try again later."

  ## UI States
  - **Loading State**
    - Display a spinner on the login button.
    - Disable all inputs and buttons.

  - **Error State**
    - Display error messages near the corresponding input fields or as a global error message.

  ## Accessibility
  - Ensure all inputs and buttons are accessible via keyboard navigation.
  - Associate error messages with inputs using `aria-describedby`.

  ## Events
  - **Form Submission**
    - Triggered on button click or `Enter` key press.
    - Validates inputs and sends a POST request to `/login`.

  ## Testing
  - Unit Tests:
    - Validate input fields render correctly.
    - Ensure validations are triggered on form submission.
    - Verify API calls with correct payload.
    - Test handling of API responses.
  - Integration Tests:
    - Simulate user interaction and check end-to-end flow.

"""
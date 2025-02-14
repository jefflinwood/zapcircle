---
title: Generating Components with ZapCircle
description: Describe the behavior for your component, and then generate the code for the JSX or TSX file
---

Write up the behavior for your new component in a `.zap.toml` file, and then let ZapCircle generate the JSX or TSX file with the `generate` command.

## Creating a ZapCircle TOML file

For this guide, we'll create a new file named `LoginForm.jsx.zap.toml`, with the following contents:

```toml title=LoginForm.jsx.zap.toml
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
```

After you create the file, you'll need to tell ZapCircle to generate the React component.

```bash
npx zapcircle generate jsx ./LoginForm.jsx.zap.toml
```

After calling out to the LLM, ZapCircle will generate a new JSX React component for you named `LoginForm.jsx`. Here's an example code listing:

```jsx title=LoginForm.jsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const LoginForm = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

  const validateEmail = (email) => {
    const format = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return format.test(email);
  };

  const validateForm = () => {
    const errors = { email: '', password: '' };
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.email || errors.password) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({ email: '', password: '' });
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        history.push('/dashboard');
      } else {
        const errorResponse = await response.json();
        if (response.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="emailError"
        />
        {formErrors.email && <span id="emailError" style={{ color: 'red' }}>{formErrors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="passwordError"
        />
        {formErrors.password && <span id="passwordError" style={{ color: 'red' }}>{formErrors.password}</span>}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading || formErrors.email || formErrors.password}>
        {loading ? <span className="spinner" /> : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
```

The nice thing about the ZapCircle approach is that you can even ask ChatGPT or another LLM to generate the behavior for you - of course, you can refine it yourself, but it makes a great starting point for common behaviors. 

Find this behavior in the Behavior Library - [Login Form](/behaviors/front-end/login-form/).
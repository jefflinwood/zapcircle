---
title: Generating Tests with ZapCircle
description: Combine the behavior with your source code to generate the code for your unit tests.
---

Once you have the behavior created along with the source code - see [Generating Code](./generating-code) for an example - ZapCircle will also help you automate your tests.

You'll need:
* The path to the behavior file (`.zap.toml`)
* The path to the source code file (`.jsx`, for example)
* Jest and React Testing Library added to your developer dependencies

# Running the `generateTests` command

Similar to how you generate code with ZapCircle, you can generate tests - there is an extra parameter that points to the code or component being tested:

```bash
npx zapcircle generateTests jsx ./LoginForm.jsx.zap.toml ./LoginForm.jsx
```

Currently, ZapCircle assumes the use of the `jest` testing framework, but that will be configurable in future versions.

# The generated tests

The built-in prompt for generating JSX tests will create a new `.test.js` file for you after calling out to the LLM.
 Here's an example code listing:

```jsx title=LoginForm.test.js
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const LoginForm = require('./LoginForm');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginForm', () => {
  test('renders email and password inputs and login button', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('displays required validation errors when fields are empty on submit', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('displays invalid email format error', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'invalidemail' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  test('displays password minimum length error', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  test('login button is disabled when form is invalid', () => {
    render(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    expect(loginButton).toBeDisabled();
  });

  test('login button is enabled when form is valid', () => {
    render(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    expect(loginButton).not.toBeDisabled();
  });

  test('submits form with correct payload and handles successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
      })
    );
    delete window.location;
    window.location = { href: '' };
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
    }));
    await waitFor(() => expect(window.location.href).toBe('/dashboard'));
  });

  test('handles 401 error response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
      })
    );
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid email or password\./i)).toBeInTheDocument();
  });

  test('handles 500 error response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 500,
      })
    );
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/something went wrong\. please try again later\./i)).toBeInTheDocument();
  });

  test('handles network error', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/something went wrong\. please try again later\./i)).toBeInTheDocument();
  });

  test('displays loading state during API call', async () => {
    let resolveFetch;
    global.fetch = jest.fn(() => new Promise((resolve) => { resolveFetch = resolve; }));
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByRole('button', { name: /loading\.\.\./i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /loading\.\.\./i })).toBeDisabled();
    resolveFetch({ status: 200 });
    await waitFor(() => expect(window.location.href).toBe('/dashboard'));
  });
});
```

Once you have the test file, you can try it out - there may be a few tweaks to get the tests to pass, but the advantage of having the LLM do the first pass is that you get some code up and going quickly!

 ZapCircle will support more refinement features in the future to help make your tests bullet-proof.

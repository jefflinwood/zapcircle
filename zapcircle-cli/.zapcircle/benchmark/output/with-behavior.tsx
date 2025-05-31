To implement the password validation with an error message in your `LoginForm`, we can manage the form state and add validation logic. This will involve using the `useState` hook to track form input values and error messages. Here’s how you can implement it:

```javascript
import React, { useState } from 'react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
    } else {
      setError(''); // Clear the error if the password is valid
      // Handle the form submission
      console.log('Form submitted:', { username, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username"
      />
      <input 
        name="password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Log In</button>
    </form>
  );
}
```

### Explanation:
1. **State Management**: We're using `useState` to keep track of the `username`, `password`, and `error` message.
2. **Form Submission**: When the form is submitted, we call `handleSubmit`, which checks if the password is less than 8 characters.
3. **Error Handling**: If the password is too short, we set an error message. If it’s valid, we can handle form submission appropriately (here, it's just logging to the console).
4. **Display Error Message**: If there's an error, it will be displayed below the password input field in red text.

This will ensure that users are informed when their password does not meet the required length.
To implement validation that shows an error message if the password is shorter than 8 characters, you will need to add some state management to handle the form submission and validation. Below is the updated code using React Hooks:

```javascript
import React, { useState } from 'react';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(''); // Reset error message on each submit.

        // Check password length
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        // Handle successful login here
        console.log('Logging in with', username, password);
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
            <button type="submit">Log In</button>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </form>
    );
}
```

### Explanation:
1. **State Management**: The `useState` hook is used to maintain user input for `username`, `password`, and to store potential validation error messages.

2. **Form Submission Handler**: The `handleSubmit` function is defined to handle form submissions. It prevents the default form submission action, resets the error message, checks the password length, and sets an error message if the validation fails.

3. **User Feedback**: If the password is shorter than 8 characters, an error message will appear below the button in red text.

4. **Input Fields**: The values of the input fields are controlled via state, and updates are handled through the `onChange` event. Each input field updates its respective state on change.

This code effectively adds validation to the `LoginForm`.
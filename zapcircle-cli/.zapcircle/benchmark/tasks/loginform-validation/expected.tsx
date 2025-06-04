import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const password = form.password.value;
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError("");
    // submit logic
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">Log In</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
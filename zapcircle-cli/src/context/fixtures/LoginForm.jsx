import React, { useState } from "react";
import Button from "./Button";
import useAuth from "./useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit">Log In</Button>
    </form>
  );
}
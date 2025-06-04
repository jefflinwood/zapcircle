import { useState, useEffect } from "react";

export function ToggleThemeButton() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.className = theme === "light" ? "theme-light" : "theme-dark";
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
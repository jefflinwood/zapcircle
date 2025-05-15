import { useContext } from "react";
import { authState } from "./authState";

export default function useAuth() {
  const login = (email) => {
    console.log("Logging in", email);
    // In reality, this would call an API
  };

  return { login };
}

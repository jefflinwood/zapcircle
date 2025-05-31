import { useEffect, useState } from "react";

export function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then(setUser);
  }, []);

  if (!user) return <div>Loading user info...</div>;

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
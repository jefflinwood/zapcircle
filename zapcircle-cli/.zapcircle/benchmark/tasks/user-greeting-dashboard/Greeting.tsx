export function Greeting({ user }) {
  if (!user || !user.name) {
    return <p>Hello, guest!</p>;
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return <p>Good {timeOfDay}, {user.name}!</p>;
}

import { Greeting } from "./Greeting";

export function Dashboard({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <Greeting user={user} />
    </div>
  );
}

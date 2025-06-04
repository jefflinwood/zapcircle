import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";

describe("Dashboard with Greeting", () => {
  test("greets logged in user with time-based message", () => {
    jest.spyOn(global, 'Date').mockImplementation(() => new Date('2024-01-01T09:00:00') as any);
    render(<Dashboard user={{ name: "Alice" }} />);
    expect(screen.getByText(/good morning, alice/i)).toBeInTheDocument();
  });

  test("greets guest if no user is passed", () => {
    render(<Dashboard user={null} />);
    expect(screen.getByText(/hello, guest/i)).toBeInTheDocument();
  });
});

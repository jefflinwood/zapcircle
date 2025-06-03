import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  test("shows error if password is shorter than 8 characters", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByRole("textbox", { name: /username/i }), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  test("does not show error if password is long enough", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "longenoughpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
  });
});

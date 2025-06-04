import { render, screen, fireEvent } from "@testing-library/react";
import { SignupForm } from "./SignupForm";

describe("SignupForm", () => {
  test("progresses to step 2 only if name and email are valid", () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.click(screen.getByText(/next/i));
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test("shows password mismatch if passwords differ", () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.click(screen.getByText(/next/i));
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: "secret456" } });
    fireEvent.click(screen.getByText(/submit/i));
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("submits if all fields are valid", () => {
    window.alert = jest.fn();
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
    fireEvent.click(screen.getByText(/next/i));
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: "secret123" } });
    fireEvent.click(screen.getByText(/submit/i));
    expect(window.alert).toHaveBeenCalledWith("Submitted!");
  });
});

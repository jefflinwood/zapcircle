import { render, screen } from "@testing-library/react";
import { ProfileStatus } from "./ProfileStatus";

describe("ProfileStatus", () => {
  test("displays 'Profile Complete' if all fields are present", () => {
    render(<ProfileStatus user={{ image: "a.png", bio: "Hi!", email: "test@example.com" }} />);
    expect(screen.getByText(/profile complete/i)).toBeInTheDocument();
  });

  test("displays 'Profile Incomplete' if image is missing", () => {
    render(<ProfileStatus user={{ bio: "Hi!", email: "test@example.com" }} />);
    expect(screen.getByText(/profile incomplete/i)).toBeInTheDocument();
  });

  test("displays placeholder if no image", () => {
    render(<ProfileStatus user={{ bio: "Hi!", email: "test@example.com" }} />);
    expect(screen.getByText(/no image/i)).toBeInTheDocument();
  });
});

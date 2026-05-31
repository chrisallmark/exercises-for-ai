import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders all exercise categories", () => {
    render(<Home />);

    expect(screen.getByText("Input, Processing & Output")).toBeInTheDocument();
    expect(screen.getByText("Calculations")).toBeInTheDocument();
    expect(screen.getByText("Making Decisions")).toBeInTheDocument();
    expect(screen.getByText("Functions")).toBeInTheDocument();
    expect(screen.getByText("Repetition")).toBeInTheDocument();
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
    expect(screen.getByText("Working with Files")).toBeInTheDocument();
    expect(screen.getByText("Working with External Services")).toBeInTheDocument();
    expect(screen.getByText("Full Programs")).toBeInTheDocument();
  });

  it("links representative exercises to their route pages", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Saying Hello" })).toHaveAttribute(
      "href",
      "/02-input-processing-and-output/01-saying-hello",
    );
    expect(screen.getByRole("link", { name: "Anagram Checker" })).toHaveAttribute(
      "href",
      "/05-functions/24-anagram-checker",
    );
    expect(screen.getByRole("link", { name: "Trivia App" })).toHaveAttribute(
      "href",
      "/10-full-programs/57-trivia-app",
    );
  });
});

import { render, screen } from "@testing-library/react";
import Exercises from "./Exercises";

describe("Exercises", () => {
  it("renders the category and children", () => {
    render(
      <Exercises
        category="Input, Processing & Output"
        color="red"
        folder="02-input-processing-and-output"
      >
        <span>Saying Hello</span>
      </Exercises>,
    );

    expect(screen.getByText("Input, Processing & Output")).toBeInTheDocument();
    expect(screen.getByText("Saying Hello")).toBeInTheDocument();
  });

  it("shows an empty state when there are no child exercises", () => {
    render(
      <Exercises
        category="Calculations"
        color="orange"
        folder="03-calculations"
      />,
    );

    expect(screen.getByText("Calculations")).toBeInTheDocument();
    expect(screen.getByText("No solutions.")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import Exercise from "./Exercise";
import { ExercisesContext } from "../Exercises/Exercises";

describe("Exercise", () => {
  it("links to the exercise page using the surrounding folder context", () => {
    render(
      <ExercisesContext.Provider
        value={{ color: "blue", folder: "07-data-structures" }}
      >
        <Exercise name="Picking a Winner" page="35-picking-a-winner" />
      </ExercisesContext.Provider>,
    );

    expect(screen.getByRole("link", { name: "Picking a Winner" })).toHaveAttribute(
      "href",
      "/07-data-structures/35-picking-a-winner",
    );
  });
});

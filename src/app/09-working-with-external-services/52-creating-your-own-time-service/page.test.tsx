import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import Page from "./page";

jest.mock("@/components", () => {
  function MockSolution({ children }: { children: ReactNode }) {
    return children;
  }

  return { Solution: MockSolution };
});

describe("Creating Your Own Time Service", () => {
  it("renders the exercise page", () => {
    const { container } = render(<Page />);

    expect(container).not.toBeEmptyDOMElement();
  });
});

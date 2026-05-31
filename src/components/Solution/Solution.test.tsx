import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Solution from "./Solution";

const back = jest.fn();

jest.mock("semantic-ui-react", () => {
  const actual = jest.requireActual("semantic-ui-react");
  const React = jest.requireActual("react");

  function MockModal({ children, open }: { children: ReactNode; open: boolean }) {
    return open ? React.createElement("div", { role: "dialog" }, children) : null;
  }

  function MockModalContent({ children }: { children: ReactNode }) {
    return React.createElement("div", null, children);
  }

  function MockModalActions({ children }: { children: ReactNode }) {
    return React.createElement("div", null, children);
  }

  MockModalContent.displayName = "MockModal.Content";
  MockModalActions.displayName = "MockModal.Actions";

  const Modal = MockModal as typeof MockModal & {
    Actions: typeof MockModalActions;
    Content: typeof MockModalContent;
  };
  Modal.Content = MockModalContent;
  Modal.Actions = MockModalActions;

  return {
    ...actual,
    Modal,
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back,
  }),
}));

describe("Solution", () => {
  beforeEach(() => {
    back.mockClear();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the category, exercise name, children, and back button", async () => {
    const user = userEvent.setup();

    render(
      <Solution category="Calculations" exercise="Simple Math">
        <p>Exercise form</p>
      </Solution>,
    );

    expect(screen.getByText("Calculations")).toBeInTheDocument();
    expect(screen.getByText("Simple Math")).toBeInTheDocument();
    expect(screen.getByText("Exercise form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go back/i }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("loads and renders markdown when the info icon is opened", async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      text: async () => "# Exercise Prompt\n\n![Diagram](diagram.png)",
    } as Response);
    const user = userEvent.setup();

    render(
      <Solution
        category="Input, Processing & Output"
        exercise="Saying Hello"
        markdown="/exercises/02-input-processing-and-output/01-saying-hello.md"
      >
        <p>Form body</p>
      </Solution>,
    );

    await user.click(document.querySelector(".info.circle.icon") as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("Exercise Prompt")).toBeInTheDocument();
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/exercises/02-input-processing-and-output/01-saying-hello.md",
    );
    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute(
      "src",
      "/exercises/02-input-processing-and-output/diagram.png",
    );
  });

  it("shows a fallback message when markdown loading fails", async () => {
    jest.mocked(globalThis.fetch).mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();

    render(
      <Solution
        category="Functions"
        exercise="Anagram Checker"
        markdown="/exercises/05-functions/24-anagram-checker.md"
      >
        <p>Form body</p>
      </Solution>,
    );

    await user.click(document.querySelector(".info.circle.icon") as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("Failed to load.")).toBeInTheDocument();
    });
  });
});

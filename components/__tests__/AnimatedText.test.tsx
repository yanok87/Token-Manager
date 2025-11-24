import { render, screen } from "@testing-library/react";
import { AnimatedText } from "../AnimatedText";

describe("AnimatedText", () => {
  it("should render the text", () => {
    render(<AnimatedText text="Loading" />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("should render with different text", () => {
    render(<AnimatedText text="Minting" />);
    expect(screen.getByText("Minting")).toBeInTheDocument();
  });

  it("should render as a span element", () => {
    const { container } = render(<AnimatedText text="Test" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });
});


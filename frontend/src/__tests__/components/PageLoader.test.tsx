import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLoader from "../../components/PageLoader";

describe("PageLoader", () => {
  it("renders the loading text", () => {
    render(<PageLoader />);
    const loaderElement = screen.getByText(/loading/i);
    expect(loaderElement).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<PageLoader />);
    expect(container).toBeTruthy();
  });
});

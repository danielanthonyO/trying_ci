import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import { describe, it, expect, vi } from "vitest";

describe("Button", () => {
  it("renders label", () => {
    render(<Button label="Save" />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button label="Save" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button label="Save" onClick={onClick} isDisabled />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies custom color and background", () => {
    render(<Button label="Save" color="red" background="black" />);

    const button = screen.getByRole("button", { name: /save/i });

    expect(button).toHaveStyle({
      color: "rgb(255, 0, 0)",
      background: "black",
    });
  });
});
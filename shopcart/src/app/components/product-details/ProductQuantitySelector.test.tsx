import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductQuantitySelector from "./ProductQuantitySelector";

describe("ProductQuantitySelector", () => {
  it("renders the current quantity", () => {
    render(
      <ProductQuantitySelector
        quantity={2}
        maxQuantity={10}
        onQuantityChange={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText("Quantity 2")
    ).toBeInTheDocument();
  });

  it("increases quantity when the increase button is clicked", async () => {
    const user = userEvent.setup();
    const onQuantityChange = jest.fn();

    render(
      <ProductQuantitySelector
        quantity={2}
        maxQuantity={10}
        onQuantityChange={onQuantityChange}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Increase quantity",
      })
    );

    expect(onQuantityChange).toHaveBeenCalledTimes(1);
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it("decreases quantity when the decrease button is clicked", async () => {
    const user = userEvent.setup();
    const onQuantityChange = jest.fn();

    render(
      <ProductQuantitySelector
        quantity={3}
        maxQuantity={10}
        onQuantityChange={onQuantityChange}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Decrease quantity",
      })
    );

    expect(onQuantityChange).toHaveBeenCalledTimes(1);
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it("disables decrease button when quantity is 1", () => {
    render(
      <ProductQuantitySelector
        quantity={1}
        maxQuantity={10}
        onQuantityChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Decrease quantity",
      })
    ).toBeDisabled();
  });

  it("does not decrease quantity when quantity is 1", async () => {
    const user = userEvent.setup();
    const onQuantityChange = jest.fn();

    render(
      <ProductQuantitySelector
        quantity={1}
        maxQuantity={10}
        onQuantityChange={onQuantityChange}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Decrease quantity",
      })
    );

    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  it("disables increase button when quantity reaches max quantity", () => {
    render(
      <ProductQuantitySelector
        quantity={10}
        maxQuantity={10}
        onQuantityChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Increase quantity",
      })
    ).toBeDisabled();
  });

  it("does not increase quantity beyond max quantity", async () => {
    const user = userEvent.setup();
    const onQuantityChange = jest.fn();

    render(
      <ProductQuantitySelector
        quantity={10}
        maxQuantity={10}
        onQuantityChange={onQuantityChange}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Increase quantity",
      })
    );

    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  it("handles zero max quantity safely", () => {
    render(
      <ProductQuantitySelector
        quantity={1}
        maxQuantity={0}
        onQuantityChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Decrease quantity",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Increase quantity",
      })
    ).toBeDisabled();
  });

  it("normalizes a quantity greater than max quantity", () => {
    render(
      <ProductQuantitySelector
        quantity={20}
        maxQuantity={10}
        onQuantityChange={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText("Quantity 10")
    ).toBeInTheDocument();
  });
});
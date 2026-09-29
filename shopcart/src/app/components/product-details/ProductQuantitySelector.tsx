
"use client";

import { Minus, Plus } from "lucide-react";

interface ProductQuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
}

export default function ProductQuantitySelector({
  quantity,
  maxQuantity,
  onQuantityChange,
}: ProductQuantitySelectorProps) {
  const safeMaxQuantity = Math.max(
    0,
    Math.floor(maxQuantity)
  );

  const safeQuantity = Math.min(
    Math.max(1, Math.floor(quantity)),
    Math.max(safeMaxQuantity, 1)
  );

  const canDecrease = safeQuantity > 1;
  const canIncrease =
    safeMaxQuantity > 0 &&
    safeQuantity < safeMaxQuantity;

  const decreaseQuantity = () => {
    if (!canDecrease) {
      return;
    }

    onQuantityChange(safeQuantity - 1);
  };

  const increaseQuantity = () => {
    if (!canIncrease) {
      return;
    }

    onQuantityChange(safeQuantity + 1);
  };

  return (
    <div
      className="quantity-selector"
      role="group"
      aria-label="Product quantity"
    >
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
      >
        <Minus
          size={16}
          aria-hidden="true"
        />
      </button>

      <span
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Quantity ${safeQuantity}`}
      >
        {safeQuantity}
      </span>

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={!canIncrease}
        aria-label="Increase quantity"
      >
        <Plus
          size={16}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}



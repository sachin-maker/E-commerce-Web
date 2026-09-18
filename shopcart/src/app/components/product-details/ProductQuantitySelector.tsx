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
  const decreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="quantity-selector">
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>

      <span aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
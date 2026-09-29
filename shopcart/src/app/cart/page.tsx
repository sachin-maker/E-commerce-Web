
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  clearCart as clearCartState,
  setCartItems,
} from "@/app/store/slices/cartSlice";
import {
  clearCart,
  removeCartItem,
  updateCartItem,
} from "@/services/cartService";

import "./Cart.css";

const formatCurrency = (amount: number) =>
  `₹${amount.toFixed(2)}`;

const getOriginalPrice = (
  price: number,
  discountPercentage: number
) => {
  if (
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return price;
  }

  return price / (1 - discountPercentage / 100);
};

export default function CartPage() {
  const dispatch = useAppDispatch();

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  const [loadingProductId, setLoadingProductId] =
    useState<string | null>(null);

  const [isClearing, setIsClearing] =
    useState(false);

  const [error, setError] = useState("");

  const {
    subtotal,
    totalItems,
    totalSavings,
  } = cartItems.reduce(
    (summary, item) => {
      const {
        price,
        discountPercentage,
      } = item.product;

      const originalPrice =
        getOriginalPrice(
          price,
          discountPercentage
        );

      summary.subtotal +=
        price * item.quantity;

      summary.totalItems += item.quantity;

      summary.totalSavings +=
        Math.max(
          originalPrice - price,
          0
        ) * item.quantity;

      return summary;
    },
    {
      subtotal: 0,
      totalItems: 0,
      totalSavings: 0,
    }
  );

  const handleUpdateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    if (!token || !isAuthenticated) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    try {
      setLoadingProductId(productId);
      setError("");

      const response =
        await updateCartItem(
          token,
          productId,
          { quantity }
        );

      dispatch(
        setCartItems(
          response.cart.items
        )
      );
    } catch (err) {
      console.error(
        "Failed to update cart item:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update cart."
      );
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleRemoveItem = async (
    productId: string
  ) => {
    if (!token || !isAuthenticated) {
      return;
    }

    try {
      setLoadingProductId(productId);
      setError("");

      const response =
        await removeCartItem(
          token,
          productId
        );

      dispatch(
        setCartItems(
          response.cart.items
        )
      );
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove item from cart."
      );
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleClearCart = async () => {
    if (!token || !isAuthenticated) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to clear your cart?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing(true);
      setError("");

      const response =
        await clearCart(token);

      dispatch(
        setCartItems(
          response.cart.items
        )
      );

      // Keep Redux explicitly synchronized
      // with the server response.
      if (
        response.cart.items.length === 0
      ) {
        dispatch(clearCartState());
      }
    } catch (err) {
      console.error(
        "Failed to clear cart:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear cart."
      );
    } finally {
      setIsClearing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>

          <p>
            You have not added any products
            to your cart yet.
          </p>

          <Link
            href="/products"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="cart-page"
      aria-labelledby="cart-title"
    >
      <div className="cart-container">
        <div className="cart-header">
          <h1
            id="cart-title"
            className="cart-title"
          >
            Shopping Cart
          </h1>

          <button
            type="button"
            className="clear-cart-btn"
            onClick={handleClearCart}
            disabled={isClearing}
            aria-busy={isClearing}
          >
            {isClearing
              ? "Clearing..."
              : "Clear Cart"}
          </button>
        </div>

        {error && (
          <div
            className="cart-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="cart-layout">
          <section
            className="cart-items"
            aria-label="Cart items"
          >
            {cartItems.map((item) => {
              const product =
                item.product;

              const originalPrice =
                getOriginalPrice(
                  product.price,
                  product.discountPercentage
                );

              const itemTotal =
                product.price *
                item.quantity;

              const isAtStockLimit =
                item.quantity >=
                product.stock;

              const isUpdating =
                loadingProductId ===
                product._id;

              return (
                <article
                  className="cart-item"
                  key={product._id}
                >
                  <div className="cart-product-image">
                    <Link
                      href={`/products/${product._id}`}
                      aria-label={`View ${product.title}`}
                    >
                      <Image
                        src={
                          product.thumbnail
                        }
                        alt={product.title}
                        width={120}
                        height={120}
                      />
                    </Link>
                  </div>

                  <div className="cart-product-details">
                    <h2>
                      {product.title}
                    </h2>

                    <div className="cart-price-details">
                      {product.discountPercentage >
                        0 && (
                        <span className="original-price">
                          {formatCurrency(
                            originalPrice
                          )}
                        </span>
                      )}

                      {product.discountPercentage >
                        0 && (
                        <span className="discount-percentage">
                          {Math.round(
                            product.discountPercentage
                          )}
                          % OFF
                        </span>
                      )}

                      <p className="cart-product-price">
                        {formatCurrency(
                          product.price
                        )}
                      </p>
                    </div>

                    <div
                      className="quantity-controls"
                      role="group"
                      aria-label={`Quantity controls for ${product.title}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          item.quantity <= 1 ||
                          isUpdating ||
                          isClearing
                        }
                        aria-label={`Decrease quantity of ${product.title}`}
                      >
                        −
                      </button>

                      <span
                        aria-live="polite"
                        aria-label={`Quantity ${item.quantity}`}
                      >
                        {isUpdating
                          ? "..."
                          : item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            product._id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          isAtStockLimit ||
                          isUpdating ||
                          isClearing
                        }
                        aria-label={`Increase quantity of ${product.title}`}
                      >
                        +
                      </button>

                      {isAtStockLimit && (
                        <p className="stock-limit-message">
                          Maximum available
                          stock reached
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        handleRemoveItem(
                          product._id
                        )
                      }
                      disabled={
                        isUpdating ||
                        isClearing
                      }
                      aria-busy={isUpdating}
                      aria-label={`Remove ${product.title} from cart`}
                    >
                      {isUpdating
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>

                  <div
                    className="cart-item-total"
                    aria-label={`Total for ${product.title}`}
                  >
                    {formatCurrency(
                      itemTotal
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <aside
            className="cart-summary"
            aria-labelledby="order-summary-title"
          >
            <h2 id="order-summary-title">
              Order Summary
            </h2>

            <div className="summary-row">
              <span>Items</span>
              <span>
                {totalItems}
              </span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>
                {formatCurrency(
                  subtotal
                )}
              </span>
            </div>

            <div className="summary-row savings-row">
              <span>You Save</span>
              <span>
                {formatCurrency(
                  totalSavings
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>

            <Link
              href="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}



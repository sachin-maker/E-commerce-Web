"use client";

import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart
} from "@/app/store/slices/cartSlice";


import "./Cart.css";

export default function CartPage() {
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector((state) => state.cart.items);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>

          <p>
            You have not added any products to your cart yet.
          </p>

          <Link href="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }
  const totalSavings = cartItems.reduce((total, item) => {
    const originalPrice =
      item.product.price /
      (1 - item.product.discountPercentage / 100);

    const savingsPerItem = originalPrice - item.product.price;

    return total + savingsPerItem * item.quantity;
  }, 0);

  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        <button
          className="clear-cart-btn"
          onClick={() => dispatch(clearCart())}
        >
          Clear Cart
        </button>

        <div className="cart-layout">
          <section className="cart-items">
            {cartItems.map((item) => (
              <div
                className="cart-item"
                key={item.product._id}
              >
                <div className="cart-product-image">
                  <Image
                    src={item.product.thumbnail}
                    alt={item.product.title}
                    width={120}
                    height={120}
                  />
                </div>

                <div className="cart-product-details">
                  <h2>{item.product.title}</h2>

                  <div className="cart-price-details">
                    <span className="original-price">
                      $
                      {(
                        item.product.price /
                        (1 - item.product.discountPercentage / 100)
                      ).toFixed(2)}
                    </span>

                    <span className="discount-percentage">
                      {item.product.discountPercentage}% OFF
                    </span>

                    <p className="cart-product-price">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        dispatch(decreaseQuantity(item.product._id))
                      }
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        dispatch(increaseQuantity(item.product._id))
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                    {item.quantity >= item.product.stock && (
                      <p className="stock-limit-message">
                        Maximum available stock reached
                      </p>
                    )}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      dispatch(removeFromCart(item.product._id))
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-total">
                  $
                  {(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>
              <span>
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row savings-row">
              <span>You Save</span>
              <span>${totalSavings.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <strong>${subtotal.toFixed(2)}</strong>
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
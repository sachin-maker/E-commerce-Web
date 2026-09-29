
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hooks";

import { setCartItems } from "@/app/store/slices/cartSlice";

import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/store/slices/wishlistSlice";

import { addToCart } from "@/services/cartService";

import type { Product } from "@/app/types/product";

import ProductQuantitySelector from "@/app/components/product-details/ProductQuantitySelector";

interface ProductInformationProps {
  product: Product;
}

export default function ProductInformation({
  product,
}: ProductInformationProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] =
    useState(false);

  const dispatch = useAppDispatch();

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const isWishlisted = useAppSelector((state) =>
    state.wishlist.items.some(
      (item) => item._id === product._id
    )
  );

  const isInCart = useAppSelector((state) =>
    state.cart.items.some(
      (item) =>
        item.product._id === product._id
    )
  );

  const discountedPrice =
    product.price *
    (1 - product.discountPercentage / 100);

  const isOutOfStock = product.stock <= 0;

  useEffect(() => {
    if (product.stock <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(
        Math.max(currentQuantity, 1),
        product.stock
      )
    );
  }, [product._id, product.stock]);

  const handleAddToCart = async () => {
    if (isAddingToCart) {
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error(
        "Please sign in to add products to your cart"
      );
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock
    ) {
      toast.error(
        `Please select a quantity between 1 and ${product.stock}`
      );
      return;
    }

    setIsAddingToCart(true);

    try {
      const response = await addToCart(token, {
        productId: product._id,
        quantity,
      });

      /*
       * Backend is the source of truth.
       * Synchronize Redux with the cart returned
       * from MongoDB.
       */
      dispatch(
        setCartItems(response.cart.items)
      );

      toast.success(
        quantity === 1
          ? `${product.title} added to cart`
          : `${quantity} × ${product.title} added to cart`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      let message =
        "Failed to add product to cart";

      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(
            error.message
          );

          if (
            parsedError &&
            typeof parsedError.message ===
              "string"
          ) {
            message = parsedError.message;
          } else {
            message = error.message;
          }
        } catch {
          message = error.message;
        }
      }

      toast.error(message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      dispatch(
        removeFromWishlist(product._id)
      );

      toast.success(
        `${product.title} removed from wishlist`
      );
    } else {
      dispatch(addToWishlist(product));

      toast.success(
        `${product.title} added to wishlist`
      );
    }
  };

  return (
    <div className="product-information">
      <span className="product-details-category">
        {product.category}
      </span>

      <h1 className="product-details-title">
        {product.title}
      </h1>

      <div className="product-details-rating-row">
        <div
          className="product-details-rating"
          aria-label={`Product rating ${product.rating.toFixed(
            1
          )} out of 5`}
        >
          <Star
            size={18}
            fill="currentColor"
            aria-hidden="true"
          />

          <strong>
            {product.rating.toFixed(1)}
          </strong>
        </div>

        <span
          className="rating-separator"
          aria-hidden="true"
        >
          |
        </span>

        <span className="product-review-link">
          {product.reviews?.length ?? 0} Reviews
        </span>
      </div>

      <p className="product-details-description">
        {product.description}
      </p>

      <div className="product-details-price-section">
        <div className="product-details-price-row">
          <span className="product-details-price">
            ${discountedPrice.toFixed(2)}
          </span>

          {product.discountPercentage > 0 && (
            <span className="product-details-original-price">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {product.discountPercentage > 0 && (
          <span className="product-details-save">
            You save{" "}
            {product.discountPercentage.toFixed(0)}%
          </span>
        )}
      </div>

      <div
        className="product-stock-status"
        aria-live="polite"
      >
        {isOutOfStock ? (
          <span className="out-of-stock">
            Out of stock
          </span>
        ) : (
          <>
            <CheckCircle2
              size={17}
              aria-hidden="true"
            />

            <span>
              In stock — {product.stock} available
            </span>
          </>
        )}
      </div>

      {product.brand && (
        <div className="product-details-meta">
          <span>Brand</span>
          <strong>{product.brand}</strong>
        </div>
      )}

      {product.sku && (
        <div className="product-details-meta">
          <span>SKU</span>
          <strong>{product.sku}</strong>
        </div>
      )}

      <div className="product-purchase-section">
        <div className="product-quantity-row">
          <span className="quantity-label">
            Quantity
          </span>

          <ProductQuantitySelector
            quantity={quantity}
            maxQuantity={product.stock}
            onQuantityChange={setQuantity}
          />
        </div>

        <div className="product-action-row">
          {isInCart ? (
            <Link
              href="/cart"
              className="add-to-cart-button"
            >
              <ShoppingCart
                size={19}
                aria-hidden="true"
              />
              Go to Cart
            </Link>
          ) : (
            <button
              type="button"
              className="add-to-cart-button"
              disabled={
                isOutOfStock ||
                isAddingToCart
              }
              onClick={handleAddToCart}
              aria-busy={isAddingToCart}
            >
              <ShoppingCart
                size={19}
                aria-hidden="true"
              />

              {isOutOfStock
                ? "Out of Stock"
                : isAddingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </button>
          )}

          <button
            type="button"
            className={`product-details-wishlist ${
              isWishlisted ? "active" : ""
            }`}
            onClick={handleWishlistToggle}
            aria-label={
              isWishlisted
                ? `Remove ${product.title} from wishlist`
                : `Add ${product.title} to wishlist`
            }
            aria-pressed={isWishlisted}
          >
            <Heart
              size={21}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="product-service-benefits">
        <div className="product-service-item">
          <Truck
            size={22}
            aria-hidden="true"
          />

          <div>
            <strong>Free Shipping</strong>

            <span>
              Free delivery on eligible orders
            </span>
          </div>
        </div>

        <div className="product-service-item">
          <ShieldCheck
            size={22}
            aria-hidden="true"
          />

          <div>
            <strong>Secure Payment</strong>

            <span>
              Safe and secure checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



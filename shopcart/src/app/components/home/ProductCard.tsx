"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  ShoppingCart,
  Star,
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

interface ProductCardProps {
  product: Product;
}

function ProductCard({
  product,
}: ProductCardProps) {
  const dispatch = useAppDispatch();

  const [isAddingToCart, setIsAddingToCart] =
    useState(false);

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

  const discountPercentage = Math.min(
    Math.max(product.discountPercentage ?? 0, 0),
    100
  );

  const discountedPrice =
    product.price *
    (1 - discountPercentage / 100);

  const rating = Number.isFinite(product.rating)
    ? product.rating
    : 0;

  const reviewCount =
    product.reviews?.length ?? 0;

  const handleAddToCart = async () => {
    if (isAddingToCart) {
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error(
        "Please sign in to add products to your cart"
      );
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      const response = await addToCart(token, {
        productId: product._id,
        quantity: 1,
      });

      // Backend is the source of truth.
      dispatch(
        setCartItems(response.cart.items)
      );

      toast.success(
        `${product.title} added to cart`
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
          } else if (error.message) {
            message = error.message;
          }
        } catch {
          if (error.message) {
            message = error.message;
          }
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
    <article className="product-card">
      <div className="product-card-image-wrapper">
        <Link
          href={`/products/${product._id}`}
          className="product-card-image-link"
          aria-label={`View ${product.title}`}
        >
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={300}
            height={240}
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              300px
            "
            className="product-card-image"
          />
        </Link>

        {discountPercentage > 0 && (
          <span className="product-discount-badge">
            -{Math.round(discountPercentage)}%
          </span>
        )}

        <button
          type="button"
          className={`product-wishlist-button ${
            isWishlisted ? "active" : ""
          }`}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={handleWishlistToggle}
        >
          <Heart
            size={18}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="product-card-content">
        <span className="product-card-category">
          {product.category}
        </span>

        <Link
          href={`/products/${product._id}`}
          className="product-card-title"
        >
          {product.title}
        </Link>

        <div
          className="product-card-rating"
          aria-label={`Product rating ${rating.toFixed(
            1
          )} out of 5`}
        >
          <Star
            size={15}
            fill="currentColor"
            aria-hidden="true"
          />

          <span>
            {rating.toFixed(1)}
          </span>

          <span className="product-review-count">
            ({reviewCount})
          </span>
        </div>

        <div className="product-card-price-row">
          <span
            className="product-card-price"
            aria-label={`Sale price ₹${discountedPrice.toFixed(
              2
            )}`}
          >
            ₹{discountedPrice.toFixed(2)}
          </span>

          {discountPercentage > 0 && (
            <span
              className="product-card-original-price"
              aria-label={`Original price ₹${product.price.toFixed(
                2
              )}`}
            >
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="product-card-actions">
          <Link
            href={`/products/${product._id}`}
            className="product-card-action"
          >
            View Product
          </Link>

          {isInCart ? (
            <Link
              href="/cart"
              className="product-card-add-button"
            >
              <ShoppingCart
                size={17}
                aria-hidden="true"
              />
              Go to Cart
            </Link>
          ) : (
            <button
              type="button"
              className="product-card-add-button"
              aria-label={
                isAddingToCart
                  ? `Adding ${product.title} to cart`
                  : `Add ${product.title} to cart`
              }
              aria-busy={isAddingToCart}
              disabled={isAddingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart
                size={17}
                aria-hidden="true"
              />

              {isAddingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);

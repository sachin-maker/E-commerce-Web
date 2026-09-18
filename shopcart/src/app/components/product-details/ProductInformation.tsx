"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Link from "next/link";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/store/slices/wishlistSlice";
import {
  CheckCircle2,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import type { Product } from "@/app/types/product";

import ProductQuantitySelector from "@/app/components/product-details/ProductQuantitySelector";
import { addToCart } from "@/app/store/slices/cartSlice";

interface ProductInformationProps {
  product: Product;
}

export default function ProductInformation({
  product,
}: ProductInformationProps) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const isWishlisted = wishlistItems.some(
    (item) => item._id === product._id
  );

  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  const isInCart = cartItems.some(
    (item) => item.product._id === product._id
  );

  const discountedPrice =
    product.price *
    (1 - product.discountPercentage / 100);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    console.log("Adding product to cart:", product);

    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart`);
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
        <div className="product-details-rating">
          <Star
            size={18}
            fill="currentColor"
          />

          <strong>
            {product.rating.toFixed(1)}
          </strong>
        </div>

        <span className="rating-separator">
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

      <div className="product-stock-status">
        {isOutOfStock ? (
          <span className="out-of-stock">
            Out of stock
          </span>
        ) : (
          <>
            <CheckCircle2 size={17} />
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
            maxQuantity={Math.max(product.stock, 1)}
            onQuantityChange={setQuantity}
          />
        </div>

        <div className="product-action-row">
          {isInCart ? (
            <Link
              href="/cart"
              className="add-to-cart-button"
            >
              <ShoppingCart size={19} />
              Go to Cart
            </Link>
          ) : (
            <button
              type="button"
              className="add-to-cart-button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={19} />
              Add to Cart
            </button>
          )}

          <button
            type="button"
            className={`product-details-wishlist ${isWishlisted ? "active" : ""
              }`}
            onClick={() => {
              if (isWishlisted) {
                dispatch(removeFromWishlist(product._id));
              } else {
                dispatch(addToWishlist(product));
              }
            }}
            aria-label={
              isWishlisted
                ? "Remove product from wishlist"
                : "Add product to wishlist"
            }
          >
            <Heart
              size={21}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className="product-service-benefits">
        <div className="product-service-item">
          <Truck size={22} />

          <div>
            <strong>Free Shipping</strong>
            <span>
              Free delivery on eligible orders
            </span>
          </div>
        </div>

        <div className="product-service-item">
          <ShieldCheck size={22} />

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
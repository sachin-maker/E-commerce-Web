"use client";

import toast from "react-hot-toast";
import {
    useAppDispatch,
    useAppSelector,
} from "@/app/store/hooks"; import { addToCart } from "@/app/store/slices/cartSlice";
import {
    addToWishlist,
    removeFromWishlist,
} from "@/app/store/slices/wishlistSlice";

import Image from "next/image";
import Link from "next/link";
import { useCallback, memo } from "react";

import {
    Heart,
    ShoppingCart,
    Star,
} from "lucide-react";


import { Product } from "@/app/types/product";


interface ProductCardProps {
    product: Product;
}

function ProductCard({
    product,
}: ProductCardProps) {
    const dispatch = useAppDispatch();

    const isWishlisted = useAppSelector((state) =>
        state.wishlist.items.some(
            (item) => item._id === product._id
        )
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


    const handleAddToCart = useCallback(() => {
        dispatch(addToCart(product));
        toast.success(`${product.title} added to cart`);
    }, [dispatch, product]);

    const handleWishlistToggle = useCallback(() => {
        if (isWishlisted) {
            dispatch(removeFromWishlist(product._id));
        } else {
            dispatch(addToWishlist(product));
        }
    }, [dispatch, isWishlisted, product]);

    return (
        <article className="product-card">
            <div className="product-card-image-wrapper">
                <Link
                    href={`/products/${product._id}`}
                    className="product-card-image-link"
                >
                    <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={300}
                        height={240}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        className="product-card-image"
                        loading="lazy"
                    />
                </Link>

                {product.discountPercentage > 0 && (
                    <span className="product-discount-badge">
                        -{Math.round(product.discountPercentage)}%
                    </span>
                )}

                <button
                    type="button"
                    className={`product-wishlist-button ${isWishlisted ? "active" : ""
                        }`}
                    aria-label={
                        isWishlisted
                            ? `Remove ${product.title} from wishlist`
                            : `Add ${product.title} to wishlist`
                    }
                    onClick={handleWishlistToggle}
                >
                    <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
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

                <div className="product-card-rating"
                    aria-label={`Product rating ${product.rating.toFixed(1)} out of 5`}
                >
                    <Star
                        size={15}
                        fill="currentColor"
                        aria-hidden="true"
                    />

                    <span>{product.rating.toFixed(1)}</span>

                    <span className="product-review-count">
                        ({product.reviews?.length ?? 0})
                    </span>
                </div>

                <div className="product-card-price-row">
                    <span className="product-card-price">
                        ${discountedPrice.toFixed(2)}
                    </span>

                    {product.discountPercentage > 0 && (
                        <span className="product-card-original-price">
                            ${product.price.toFixed(2)}
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
                            aria-label={`Add ${product.title} to cart`}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart
                                size={17}
                                aria-hidden="true"
                            />
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default memo(ProductCard);
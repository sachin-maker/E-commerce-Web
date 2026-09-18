"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "@/app/components/home/ProductCard";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearWishlist } from "@/app/store/slices/wishlistSlice";
import styles from "./Wishlist.module.css";

const WishlistPage = () => {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  if (wishlistItems.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h1 className={styles.emptyTitle}>My Wishlist</h1>

            <p className={styles.emptyText}>
              You haven’t added any products to your wishlist yet.
            </p>

            <Link
              href="/products"
              className={styles.browseButton}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Wishlist</h1>

            <p className={styles.subtitle}>
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1
                ? "product"
                : "products"}{" "}
              saved
            </p>
          </div>

          <button
            type="button"
            className={styles.clearButton}
            onClick={() => dispatch(clearWishlist())}
          >
            Clear Wishlist
          </button>
        </div>

        <div className={styles.productsGrid}>
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default WishlistPage;
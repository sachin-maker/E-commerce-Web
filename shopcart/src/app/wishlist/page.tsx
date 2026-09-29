"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/home/ProductCard";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearWishlist } from "@/app/store/slices/wishlistSlice";
import styles from "./Wishlist.module.css";

export default function WishlistPage() {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <main className={styles.page}>
        <section
          className={styles.loadingState}
          aria-label="Loading wishlist"
        >
          <p>Loading wishlist...</p>
        </section>
      </main>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <main className={styles.page}>
        <section
          className={styles.emptyState}
          aria-labelledby="empty-wishlist-title"
        >
          <div className={styles.emptyContent}>
            <h1
              id="empty-wishlist-title"
              className={styles.emptyTitle}
            >
              My Wishlist
            </h1>

            <p className={styles.emptyText}>
              You haven&apos;t added any products to your
              wishlist yet.
            </p>

            <Link
              href="/products"
              className={styles.browseButton}
            >
              Browse Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>My Wishlist</h1>

            <p
              className={styles.subtitle}
              aria-live="polite"
            >
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
            aria-label={`Clear all ${wishlistItems.length} wishlist ${
              wishlistItems.length === 1
                ? "product"
                : "products"
            }`}
          >
            Clear Wishlist
          </button>
        </header>

        <section aria-labelledby="wishlist-products-title">
          <h2
            id="wishlist-products-title"
            className={styles.visuallyHidden}
          >
            Wishlist Products
          </h2>

          <div className={styles.productsGrid}>
            {wishlistItems.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

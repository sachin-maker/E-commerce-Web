"use client";

import styles from "./Wishlist.module.css";

const WishlistLoading = () => {
  return (
    <main
      className={styles.page}
      aria-labelledby="wishlist-loading-title"
    >
      <div className={styles.container}>
        <header className={styles.loadingHeader}>
          <div
            className={styles.loadingTitle}
            aria-hidden="true"
          />

          <div
            className={styles.loadingSubtitle}
            aria-hidden="true"
          />
        </header>

        <h1
          id="wishlist-loading-title"
          className={styles.visuallyHidden}
        >
          Loading wishlist
        </h1>

        <div
          className={styles.productsGrid}
          aria-hidden="true"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={styles.skeletonCard}
            >
              <div
                className={styles.skeletonImage}
              />

              <div className={styles.skeletonContent}>
                <div
                  className={
                    styles.skeletonTitle
                  }
                />

                <div
                  className={
                    styles.skeletonText
                  }
                />

                <div
                  className={
                    styles.skeletonButton
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <p className={styles.visuallyHidden}>
          Loading wishlist products...
        </p>
      </div>
    </main>
  );
};

export default WishlistLoading;

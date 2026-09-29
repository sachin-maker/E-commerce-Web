
"use client";

import ProductGrid from "@/app/components/products/ProductGrid";
import { useAppSelector } from "@/app/store/hooks";

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({
  currentProductId,
}: RecentlyViewedProps) {
  const recentlyViewedProducts =
    useAppSelector(
      (state) =>
        state.recentlyViewed.products
    );

  const products =
    recentlyViewedProducts.filter(
      (product) =>
        product._id !== currentProductId
    );

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="recently-viewed-section"
      aria-labelledby="recently-viewed-title"
    >
      <div className="recently-viewed-header">
        <span className="section-eyebrow">
          Your Activity
        </span>

        <h2
          id="recently-viewed-title"
          className="recently-viewed-title"
        >
          Recently Viewed
        </h2>

        <p className="recently-viewed-description">
          Products you viewed recently.
        </p>
      </div>

      <ProductGrid
        products={products}
        isLoading={false}
        isFetching={false}
      />
    </section>
  );
}



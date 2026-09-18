"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/index";
import ProductGrid from "@/app/components/products/ProductGrid";

interface RecentlyViewedProps {
  currentProductId: number;
}

export default function RecentlyViewed({
  currentProductId,
}: RecentlyViewedProps) {
  const products = useSelector(
    (state: RootState) =>
      state.recentlyViewed.products.filter(
        (product) => product._id !== currentProductId
      )
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-header">
        <span className="section-eyebrow">
          Your Activity
        </span>

        <h2 className="recently-viewed-title">
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
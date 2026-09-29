
import { memo } from "react";

import ProductCard from "@/app/components/home/ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import type { Product } from "@/app/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isFetching?: boolean;
}

function ProductGrid({
  products,
  isLoading = false,
  isFetching = false,
}: ProductGridProps) {
  /*
   * Initial loading:
   * Show skeleton cards instead of an empty grid.
   */
  if (isLoading) {
    return (
      <div
        className="products-grid"
        aria-busy="true"
        aria-label="Loading products"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  /*
   * Keep the existing products visible while RTK Query
   * fetches the next/updated result set.
   */
  return (
    <div
      className={`products-grid${
        isFetching
          ? " products-grid-fetching"
          : ""
      }`}
      aria-busy={isFetching}
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);



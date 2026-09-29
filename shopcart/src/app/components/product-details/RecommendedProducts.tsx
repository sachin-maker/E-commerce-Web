
"use client";

import type { Product } from "@/app/types/product";

import {
  useAppSelector,
} from "@/app/store/hooks";

import ProductCard from "@/app/components/home/ProductCard";
import ProductSkeleton from "@/app/components/products/ProductSkeleton";

import {
  useGetProductsByCategoryQuery,
} from "@/app/store/api/productApi";

interface RecommendedProductsProps {
  product: Product;
}

export default function RecommendedProducts({
  product,
}: RecommendedProductsProps) {
  const recentlyViewedProducts =
    useAppSelector(
      (state) =>
        state.recentlyViewed.products
    );

  /*
   * Find the first recently viewed product
   * from a different category.
   */
  const recommendedCategory =
    recentlyViewedProducts.find(
      (item) =>
        item._id !== product._id &&
        item.category !== product.category
    )?.category ?? null;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetProductsByCategoryQuery(
    {
      category: recommendedCategory ?? "",
      limit: 5,
      skip: 0,
    },
    {
      skip: !recommendedCategory,
    }
  );

  /*
   * Create a Set once so we don't repeatedly
   * scan recently viewed products for every
   * recommended product.
   */
  const recentlyViewedIds = new Set(
    recentlyViewedProducts.map(
      (item) => item._id
    )
  );

  const recommendedProducts =
    data?.products
      .filter(
        (recommendedProduct) =>
          recommendedProduct._id !== product._id &&
          !recentlyViewedIds.has(
            recommendedProduct._id
          )
      )
      .slice(0, 4) ?? [];

  /*
   * Don't render recommendations when there
   * isn't enough browsing context.
   */
  if (!recommendedCategory) {
    return null;
  }

  /*
   * If the request completed successfully but
   * there are no recommendations, hide the section.
   */
  if (
    !isLoading &&
    !isError &&
    recommendedProducts.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="recommended-products-section"
      aria-labelledby="recommended-products-title"
    >
      <div className="recommended-products-header">
        <span className="section-eyebrow">
          Based on your activity
        </span>

        <h2
          id="recommended-products-title"
          className="recommended-products-title"
        >
          Recommended for You
        </h2>

        <p className="recommended-products-description">
          Products based on what you viewed recently.
        </p>
      </div>

      {isLoading ? (
        <div
          className="products-grid"
          aria-busy="true"
          aria-label="Loading recommended products"
        >
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <ProductSkeleton
                key={`recommended-skeleton-${index}`}
              />
            )
          )}
        </div>
      ) : isError ? (
        <div className="product-section-message">
          <p>
            Unable to load recommended products.
          </p>

          <button
            type="button"
            className="retry-button"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {recommendedProducts.map(
            (recommendedProduct) => (
              <ProductCard
                key={recommendedProduct._id}
                product={recommendedProduct}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}



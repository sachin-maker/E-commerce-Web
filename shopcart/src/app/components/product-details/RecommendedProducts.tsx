
"use client";

import { useSelector } from "react-redux";

import type { RootState } from "@/app/store/index";
import type { Product } from "@/app/types/product";

import ProductCard from "@/app/components/home/ProductCard";
import ProductSkeleton from "@/app/components/products/ProductSkeleton";

import { useGetProductsByCategoryQuery } from "@/app/store/api/dummyJsonApi";

interface RecommendedProductsProps {
  product: Product;
}

export default function RecommendedProducts({
  product,
}: RecommendedProductsProps) {
  const recentlyViewedProducts = useSelector(
    (state: RootState) =>
      state.recentlyViewed.products
  );

  // Find a category from recently viewed products
  // that is different from the current product category.
  const recommendedCategory =
    recentlyViewedProducts.find(
      (item) =>
        item._id !== product._id &&
        item.category !== product.category
    )?.category ?? null;

  const { data, isLoading } =
    useGetProductsByCategoryQuery(
      {
        category: recommendedCategory ?? "",
        limit: 5,
        skip: 0,
      },
      {
        skip: !recommendedCategory,
      }
    );

  const recommendedProducts =
    data?.products
      .filter(
        (recommendedProduct) =>
          recommendedProduct._id !== product._id &&
          !recentlyViewedProducts.some(
            (item) =>
              item._id === recommendedProduct._id
          )
      )
      .slice(0, 4) ?? [];

  // If there is not enough browsing history,
  // don't show the recommendation section.
  if (
    !recommendedCategory ||
    (!isLoading && recommendedProducts.length === 0)
  ) {
    return null;
  }

  return (
    <section className="recommended-products-section">
      <div className="recommended-products-header">
        <span className="section-eyebrow">
          Based on your activity
        </span>

        <h2 className="recommended-products-title">
          Recommended for You
        </h2>

        <p className="recommended-products-description">
          Products based on what you viewed recently.
        </p>
      </div>

      {isLoading ? (
        <div className="products-grid">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <ProductSkeleton key={index} />
            )
          )}
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


"use client";

import Link from "next/link";

import {
  useGetProductsByCategoryQuery,
} from "@/app/store/api/productApi";

import type { Product } from "@/app/types/product";

import ProductCard from "@/app/components/home/ProductCard";
import ProductSkeleton from "@/app/components/products/ProductSkeleton";

interface RelatedProductsProps {
  product: Product;
}

export default function RelatedProducts({
  product,
}: RelatedProductsProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetProductsByCategoryQuery({
    category: product.category,
    limit: 5,
    skip: 0,
  });

  const relatedProducts =
    data?.products
      .filter(
        (relatedProduct) =>
          relatedProduct._id !== product._id
      )
      .slice(0, 4) ?? [];

  return (
    <section
      className="related-products-section"
      aria-labelledby="related-products-title"
    >
      <div className="related-products-header">
        <div>
          <span className="section-eyebrow">
            You may also like
          </span>

          <h2
            id="related-products-title"
            className="related-products-title"
          >
            Related Products
          </h2>
        </div>

        <Link
          href={`/products?category=${encodeURIComponent(
            product.category
          )}`}
          className="view-all-products-link"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div
          className="products-grid"
          aria-busy="true"
          aria-label="Loading related products"
        >
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <ProductSkeleton
                key={`related-skeleton-${index}`}
              />
            )
          )}
        </div>
      ) : isError ? (
        <div className="product-section-message">
          <p>
            Unable to load related products.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      ) : relatedProducts.length === 0 ? (
        <div className="product-section-message">
          <p>
            No related products available.
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {relatedProducts.map(
            (relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={relatedProduct}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}



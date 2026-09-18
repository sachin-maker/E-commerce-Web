"use client";

import Link from "next/link";

import { useGetProductsByCategoryQuery } from "@/app/store/api/dummyJsonApi";

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
    <section className="related-products-section">
      <div className="related-products-header">
        <div>
          <span className="section-eyebrow">
            You may also like
          </span>

          <h2 className="related-products-title">
            Related Products
          </h2>
        </div>

        <Link
          href={`/products/category/${product.category}`}
          className="view-all-products-link"
        >
          View All
        </Link>
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
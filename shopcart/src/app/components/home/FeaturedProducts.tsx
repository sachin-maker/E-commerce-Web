
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";



import "./FeaturedProducts.css";
import { Product } from "@/app/types/product";
import { useGetFeaturedProductsQuery } from "@/app/store/api/dummyJsonApi";

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const discountPrice =
    product.price *
    (1 - product.discountPercentage / 100);

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={300}
            height={240}
            className="product-image"
          />
        </Link>

        <span className="product-discount">
          -{Math.round(product.discountPercentage)}%
        </span>

        <button
          type="button"
          className="product-wishlist"
          aria-label={`Add ${product.title} to wishlist`}
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <Link
          href={`/products/${product._id}`}
          className="product-title"
        >
          {product.title}
        </Link>

        <div className="product-rating">
          <Star
            size={14}
            fill="#f59e0b"
            color="#f59e0b"
          />

          <span>{product.rating.toFixed(1)}</span>

          <span className="product-review-count">
            ({product.reviews?.length ?? 0} reviews)
          </span>
        </div>

        <div className="product-bottom">
          <div className="product-prices">
            <strong>
              ₹{discountPrice.toFixed(2)}
            </strong>

            <del>
              ₹{product.price.toFixed(2)}
            </del>
          </div>

          <Link
            href={`/products/${product._id}`}
            className="product-add-button"
            aria-label={`View ${product.title}`}
          >
            <ShoppingCart size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-card product-skeleton">
      <div className="skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetFeaturedProductsQuery();

  return (
    <section className="featured-section">
      <div className="home-container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Handpicked for you
            </span>

            <h2>Featured Products</h2>

            <p>
              Discover our most popular products.
            </p>
          </div>

          <Link
            href="/products"
            className="section-view-all"
          >
            View All Products
            <ArrowRight size={17} />
          </Link>
        </div>

        {isLoading && (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="products-error">
            <p>
              Unable to load products. Please try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="products-grid">
            {data?.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
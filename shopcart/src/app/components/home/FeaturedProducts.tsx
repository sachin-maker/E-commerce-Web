import Link from "next/link";
import { ArrowRight } from "lucide-react";

import "./FeaturedProducts.css";

import ProductCard from "@/app/components/home/ProductCard";
import { getFeaturedProducts } from "@/lib/server/products";
import type { Product } from "@/app/types/product";

function ProductSkeleton() {
  return (
    <div
      className="product-card product-skeleton"
      aria-hidden="true"
    >
      <div className="skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

export default async function FeaturedProducts() {
  let products: Product[] = [];

  try {
    products = await getFeaturedProducts();
  } catch (error) {
    console.error(
      "Failed to load featured products:",
      error
    );
  }

  return (
    <section
      className="featured-section"
      aria-labelledby="featured-products-title"
    >
      <div className="home-container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Handpicked for you
            </span>

            <h2 id="featured-products-title">
              Featured Products
            </h2>

            <p>
              Explore popular products selected from
              the ShopCart collection.
            </p>
          </div>

          <Link
            href="/products"
            className="section-view-all"
            aria-label="View all products"
          >
            View All Products

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            className="products-empty"
            role="status"
          >
            <p>
              Featured products are temporarily
              unavailable.
            </p>

            <Link
              href="/products"
              className="section-view-all"
            >
              Browse Products

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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

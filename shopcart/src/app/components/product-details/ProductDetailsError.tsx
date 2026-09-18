"use client";

import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ProductDetailsErrorProps {
  onRetry: () => void;
}

export default function ProductDetailsError({
  onRetry,
}: ProductDetailsErrorProps) {
  return (
    <main className="product-details-page">
      <div className="container">
        <section className="products-state error-state">
          <AlertCircle size={46} />

          <h1>
            Unable to load product
          </h1>

          <p>
            We could not load this product. Please
            try again.
          </p>

          <div className="error-state-actions">
            <button
              type="button"
              className="state-action-button"
              onClick={onRetry}
            >
              <RefreshCw size={17} />
              Try Again
            </button>

            <Link
              href="/products"
              className="state-action-button secondary"
            >
              Back to Products
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useEffect } from "react";

interface ProductDetailsErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ProductDetailsError({
    error,
    reset,
}: ProductDetailsErrorProps) {
    useEffect(() => {
        console.error("Product details page error:", error);
    }, [error]);

    return (
        <main className="product-details-page">
            <section className="product-error-state">
                <h1>Unable to load product</h1>

                <p>
                    Something went wrong while loading this product.
                    Please try again.
                </p>

                <button
                    type="button"
                    className="product-error-retry-button"
                    onClick={() => reset()}
                >
                    Try Again
                </button>
            </section>
        </main>
    );
}
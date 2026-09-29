"use client";

import { useEffect } from "react";

interface ProductsErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ProductsError({
    error,
    reset,
}: ProductsErrorProps) {
    useEffect(() => {
        console.error("Products page error:", error);
    }, [error]);

    return (
        <main className="products-page">
            <div className="products-container">
                <section className="product-error-state">
                    <h1>Something went wrong</h1>

                    <p>
                       We couldn&apos;t load the products. Please try again.
                    </p>

                    <button
                        type="button"
                        className="product-error-retry-button"
                        onClick={() => reset()}
                    >
                        Try Again
                    </button>
                </section>
            </div>
        </main>
    );
}

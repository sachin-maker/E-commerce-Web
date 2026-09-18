import Link from "next/link";

export default function ProductNotFound() {
    return (
        <main className="product-details-page">
            <section className="product-error-state">
                <h1>Product Not Found</h1>

                <p>
                    Sorry, we couldn&apos;t find the product you&apos;re looking for.
                </p>

                <Link
                    href="/products"
                    className="product-error-retry-button"
                >
                    Browse Products
                </Link>
            </section>
        </main>
    );
}
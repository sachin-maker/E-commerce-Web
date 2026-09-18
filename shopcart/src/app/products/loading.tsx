"use client"

import ProductSkeleton from "@/app/components/products/ProductSkeleton";

export default function ProductsLoading() {
    return (
        <main className="products-page">
            <div className="products-container">
                <div className="products-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            </div>
        </main>
    );
}
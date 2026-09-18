
import { Product } from "@/app/types/product";
import ProductCard from "@/app/components/home/ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { memo } from "react";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isFetching?: boolean;
}

 function ProductGrid({
  products,
  isLoading = false,
  isFetching = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="products-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="products-grid products-grid-fetching">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
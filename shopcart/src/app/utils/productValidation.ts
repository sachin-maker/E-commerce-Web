import type { Product } from "@/app/types/product";

export const isValidProduct = (
  product: Product
): product is Product => {
  return (
    Boolean(product) &&
    typeof product._id === "string" &&
    Boolean(product._id) &&
    typeof product.title === "string" &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    Array.isArray(product.images) &&
    typeof product.thumbnail === "string"
  );
};

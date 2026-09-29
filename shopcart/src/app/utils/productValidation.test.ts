import { isValidProduct } from "./productValidation";
import type { Product } from "@/app/types/product";

describe("isValidProduct", () => {
  const validProduct: Product = {
    _id: "product-1",
    title: "Test Product",
    description: "Test product description",
    price: 999,
    discountPercentage: 10,
    rating: 4.5,
    stock: 20,
    brand: "Test Brand",
    category: "electronics",
    thumbnail: "/images/product.jpg",
    images: ["/images/product.jpg"],
    isActive: true,
  };

  it("returns true for a valid product", () => {
    expect(isValidProduct(validProduct)).toBe(true);
  });

  it("returns false when _id is missing", () => {
    const product = {
      ...validProduct,
      _id: "",
    };

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when _id is not a string", () => {
    const product = {
      ...validProduct,
      _id: 123,
    } as unknown as Product;

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when title is not a string", () => {
    const product = {
      ...validProduct,
      title: 123,
    } as unknown as Product;

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when price is not a number", () => {
    const product = {
      ...validProduct,
      price: "999",
    } as unknown as Product;

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when price is NaN", () => {
    const product = {
      ...validProduct,
      price: NaN,
    };

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when price is Infinity", () => {
    const product = {
      ...validProduct,
      price: Infinity,
    };

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when images is not an array", () => {
    const product = {
      ...validProduct,
      images: "/images/product.jpg",
    } as unknown as Product;

    expect(isValidProduct(product)).toBe(false);
  });

  it("returns false when thumbnail is not a string", () => {
    const product = {
      ...validProduct,
      thumbnail: 123,
    } as unknown as Product;

    expect(isValidProduct(product)).toBe(false);
  });
});
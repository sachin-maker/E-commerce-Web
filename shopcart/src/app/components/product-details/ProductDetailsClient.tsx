
"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ChevronRight,
  Home,
} from "lucide-react";

import {
  useGetProductByIdQuery,
} from "@/app/store/api/productApi";

import {
  useAppDispatch,
} from "@/app/store/hooks";

import {
  addRecentlyViewed,
} from "@/app/store/slices/recentlyViewedSlice";

import ProductDetailsError from "@/app/components/product-details/ProductDetailsError";
import ProductDetailsSkeleton from "@/app/components/product-details/ProductDetailsSkeleton";
import ProductImageGallery from "@/app/components/product-details/ProductImageGallery";
import ProductInformation from "@/app/components/product-details/ProductInformation";
import RelatedProducts from "@/app/components/product-details/RelatedProducts";
import ProductReviews from "@/app/components/product-details/ProductReviews";
import RecentlyViewed from "@/app/components/product-details/RecentlyViewed";
import RecommendedProducts from "@/app/components/product-details/RecommendedProducts";

interface ProductDetailsClientProps {
  productId: string;
}

export default function ProductDetailsClient({
  productId,
}: ProductDetailsClientProps) {
  const dispatch = useAppDispatch();

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useGetProductByIdQuery(productId);

  useEffect(() => {
    if (!product) {
      return;
    }

    dispatch(addRecentlyViewed(product));
  }, [dispatch, product?._id]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <ProductDetailsError
        onRetry={refetch}
      />
    );
  }

  return (
    <main className="product-details-page">
      <div className="container">
        <nav
          className="product-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link href="/">
            <Home
              size={15}
              aria-hidden="true"
            />
            <span>Home</span>
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <Link href="/products">
            Products
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <span aria-current="page">
            {product.title}
          </span>
        </nav>

        <section
          className="product-details-layout"
          aria-label="Product details"
        >
          <ProductImageGallery product={product} />

          <ProductInformation product={product} />
        </section>

        <section
          className="product-description-section"
          aria-labelledby="product-information-title"
        >
          <span className="section-eyebrow">
            Product Information
          </span>

          <h2
            id="product-information-title"
            className="product-description-title"
          >
            About this product
          </h2>

          <p className="product-description-text">
            {product.description}
          </p>

          <div className="product-specifications">
            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>

            <div>
              <span>Stock</span>
              <strong>{product.stock}</strong>
            </div>

            {product.warrantyInformation && (
              <div>
                <span>Warranty</span>
                <strong>
                  {product.warrantyInformation}
                </strong>
              </div>
            )}

            {product.shippingInformation && (
              <div>
                <span>Shipping</span>
                <strong>
                  {product.shippingInformation}
                </strong>
              </div>
            )}

            {product.returnPolicy && (
              <div>
                <span>Return Policy</span>
                <strong>
                  {product.returnPolicy}
                </strong>
              </div>
            )}
          </div>
        </section>

        <ProductReviews
          reviews={product.reviews}
          rating={product.rating}
        />

        <RelatedProducts product={product} />

        <RecommendedProducts product={product} />

        <RecentlyViewed
          currentProductId={product._id}
        />
      </div>
    </main>
  );
}



"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/app/types/product";

interface ProductImageGalleryProps {
  product: Product;
}

export default function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  const images = useMemo(() => {
    const productImages = Array.isArray(product.images)
      ? product.images
          .filter(
            (image): image is string =>
              typeof image === "string" &&
              image.trim().length > 0
          )
          .map((image) => image.trim())
      : [];

    const thumbnail =
      typeof product.thumbnail === "string"
        ? product.thumbnail.trim()
        : "";

    const allImages =
      productImages.length > 0
        ? productImages
        : thumbnail
          ? [thumbnail]
          : [];

    return allImages.filter(
      (image, index, array) =>
        array.indexOf(image) === index
    );
  }, [product.images, product.thumbnail]);

  const [selectedImage, setSelectedImage] = useState(
    images[0] ?? ""
  );

  const discountPercentage = Math.min(
    Math.max(
      Number(product.discountPercentage) || 0,
      0
    ),
    100
  );

  useEffect(() => {
    setSelectedImage(images[0] ?? "");
  }, [images]);

  if (images.length === 0) {
    return (
      <div
        className="product-gallery product-gallery-empty"
        aria-label="No product image available"
      >
        <div className="product-gallery-main">
          <div
            className="product-image-placeholder"
            role="img"
            aria-label="Product image unavailable"
          >
            No image available
          </div>
        </div>
      </div>
    );
  }

  const selectedImageIndex = Math.max(
    0,
    images.indexOf(selectedImage)
  );

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <Image
          src={selectedImage}
          alt={`${product.title} - product image ${
            selectedImageIndex + 1
          }`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="product-main-image"
          placeholder="blur"
          blurDataURL="/images/product-placeholder.svg"
        />

        {discountPercentage > 0 && (
          <span className="product-gallery-discount">
            -{Math.round(discountPercentage)}%
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="product-gallery-thumbnails"
          role="group"
          aria-label="Product images"
        >
          {images.map((image, index) => {
            const isSelected =
              selectedImage === image;

            return (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`product-thumbnail-button ${
                  isSelected ? "active" : ""
                }`}
                onClick={() =>
                  setSelectedImage(image)
                }
                aria-label={`View product image ${
                  index + 1
                }`}
                aria-pressed={isSelected}
              >
                <Image
                  src={image}
                  alt={`${product.title} thumbnail ${
                    index + 1
                  }`}
                  width={90}
                  height={90}
                  className="product-thumbnail-image"
                  loading={
                    index === 0
                      ? "eager"
                      : "lazy"
                  }
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
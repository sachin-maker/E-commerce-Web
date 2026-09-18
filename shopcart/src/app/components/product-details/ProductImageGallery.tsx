"use client";

import Image from "next/image";
import { useState } from "react";

import type { Product } from "@/app/types/product";

interface ProductImageGalleryProps {
  product: Product;
}

export default function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  const images =
    product.images?.length > 0
      ? product.images
      : [product.thumbnail];

  const [selectedImage, setSelectedImage] = useState(
    images[0]
  );

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <Image
          src={selectedImage}
          alt={product.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="product-main-image"
          placeholder="blur"
          blurDataURL="/images/product-placeholder.svg"
        />

        {product.discountPercentage > 0 && (
          <span className="product-gallery-discount">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>

      <div className="product-gallery-thumbnails">
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image}-${index}`}
            className={`product-thumbnail-button ${selectedImage === image
              ? "active"
              : ""
              }`}
            onClick={() => setSelectedImage(image)}
            aria-label={`View product image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${product.title} image ${index + 1}`}
              width={90}
              height={90}
              className="product-thumbnail-image"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/app/components/product-details/ProductDetailsClient";
import type { Product } from "@/app/types/product";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProductApiResponse {
  success: boolean;
  product: Product;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopcart.com";

async function getProduct(
  id: string
): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  try {
    const response = await fetch(
      `${apiUrl}/products/${encodeURIComponent(id)}`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch product: ${response.status}`
      );
    }

    const data: ProductApiResponse =
      await response.json();

    if (!data.success || !data.product) {
      return null;
    }

    return data.product;
  } catch (error) {
    console.error(
      "Product SEO fetch failed:",
      error
    );

    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!id?.trim()) {
    return {
      title: "Product Not Found",
      description:
        "The requested product could not be found on ShopCart.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "The requested product could not be found on ShopCart.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${product.title} | ShopCart`;

  const description =
    product.description?.trim() ||
    `Buy ${product.title} online at ShopCart. Check price, availability, reviews and product details.`;

  const productUrl = `/products/${encodeURIComponent(
    product._id
  )}`;

  const productImage =
    product.thumbnail ||
    product.images?.[0];

  return {
    title,
    description,

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: productUrl,
      siteName: "ShopCart",
      locale: "en_IN",
      ...(productImage && {
        images: [
          {
            url: productImage,
            alt: product.title,
          },
        ],
      }),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(productImage && {
        images: [productImage],
      }),
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

function createProductJsonLd(product: Product) {
  const productImages = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(Array.isArray(product.images)
      ? product.images
      : []),
  ].filter(
    (image, index, images) =>
      Boolean(image) &&
      images.indexOf(image) === index
  );

  const discountPercentage = Math.min(
    Math.max(
      Number(product.discountPercentage) || 0,
      0
    ),
    100
  );

  const price = Math.max(
    Number(product.price) || 0,
    0
  );

  const discountedPrice =
    discountPercentage > 0
      ? price * (1 - discountPercentage / 100)
      : price;

  const reviewCount = Array.isArray(
    product.reviews
  )
    ? product.reviews.length
    : 0;

  const rating = Number(product.rating);

  const hasValidRating =
    Number.isFinite(rating) &&
    rating >= 1 &&
    rating <= 5 &&
    reviewCount > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.title,

    description:
      product.description?.trim() || undefined,

    image:
      productImages.length > 0
        ? productImages
        : undefined,

    sku: product._id,

    ...(product.brand?.trim() && {
      brand: {
        "@type": "Brand",
        name: product.brand.trim(),
      },
    }),

    ...(hasValidRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: reviewCount,
      },
    }),

    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${encodeURIComponent(
        product._id
      )}`,
      priceCurrency: "INR",
      price: discountedPrice.toFixed(2),

      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",
    },
  };

  return JSON.stringify(jsonLd).replace(
    /</g,
    "\\u003c"
  );
}

function createBreadcrumbJsonLd(product: Product) {
  const productUrl =
    `${siteUrl}/products/${encodeURIComponent(
      product._id
    )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return JSON.stringify(jsonLd).replace(
    /</g,
    "\\u003c"
  );
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  if (!id?.trim()) {
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const productJsonLd =
    createProductJsonLd(product);

  const breadcrumbJsonLd =
    createBreadcrumbJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: productJsonLd,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd,
        }}
      />

      <ProductDetailsClient productId={id} />
    </>
  );
}


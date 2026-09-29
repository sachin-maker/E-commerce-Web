
import type { Metadata } from "next";

import ProductsPageClient from "@/app/components/products/ProductsPageClient";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopcart.com";

const PRODUCT_PAGE_TITLE =
  "All Products | ShopCart";

const PRODUCT_PAGE_DESCRIPTION =
  "Explore products on ShopCart. Browse products by category, search for products, filter by price, and sort by your preferences.";

const parsePage = (
  value?: string
): number => {
  if (!value) {
    return 1;
  }

  const page = Number(value);

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;

  const page = parsePage(params.page);

  const hasSearch =
    Boolean(params.search?.trim());

  const hasCategory =
    Boolean(params.category?.trim());

  const hasSort =
    Boolean(params.sort?.trim());

  const hasMinPrice =
    Boolean(params.minPrice?.trim());

  const hasMaxPrice =
    Boolean(params.maxPrice?.trim());

  const hasFilters =
    hasSearch ||
    hasCategory ||
    hasSort ||
    hasMinPrice ||
    hasMaxPrice;

  /*
   * The clean catalog page is the primary
   * SEO landing page.
   */
  if (!hasFilters) {
    const canonicalPath =
      page === 1
        ? "/products"
        : `/products?page=${page}`;

    const title =
      page === 1
        ? PRODUCT_PAGE_TITLE
        : `Products - Page ${page} | ShopCart`;

    const description =
      page === 1
        ? PRODUCT_PAGE_DESCRIPTION
        : `Browse page ${page} of ShopCart products. Explore our latest products and discover great deals.`;

    return {
      title,
      description,

      alternates: {
        canonical: canonicalPath,
      },

      openGraph: {
        type: "website",
        title,
        description,
        url: canonicalPath,
        siteName: "ShopCart",
        locale: "en_IN",
      },

      twitter: {
        card: "summary",
        title,
        description,
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  }

  /*
   * Search, filtering, sorting and price
   * combinations are intentionally not indexed.
   *
   * These can produce a very large number
   * of low-value/duplicate URLs.
   *
   * Once dedicated category/brand SEO routes
   * exist, those routes can be indexed instead.
   */
  return {
    title: PRODUCT_PAGE_TITLE,
    description: PRODUCT_PAGE_DESCRIPTION,

    alternates: {
      canonical: "/products",
    },

    openGraph: {
      type: "website",
      title: PRODUCT_PAGE_TITLE,
      description: PRODUCT_PAGE_DESCRIPTION,
      url: "/products",
      siteName: "ShopCart",
      locale: "en_IN",
    },

    twitter: {
      card: "summary",
      title: PRODUCT_PAGE_TITLE,
      description: PRODUCT_PAGE_DESCRIPTION,
    },

    robots: {
      index: false,
      follow: true,

      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}



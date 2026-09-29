
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductGrid from "@/app/components/products/ProductGrid";
import type { Product } from "@/app/types/product";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

interface CategoryProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    currentPage: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopcart.com";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL;

const PRODUCTS_PER_PAGE = 12;

function normalizeCategory(
  category: string
): string {
  return decodeURIComponent(category)
    .trim()
    .toLowerCase();
}

function formatCategoryName(
  category: string
): string {
  return category
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function parsePage(
  value?: string
): number {
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
}

async function getCategoryProducts(
  category: string,
  page: number
): Promise<CategoryProductsResponse | null> {
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const encodedCategory =
    encodeURIComponent(category);

  const skip =
    (page - 1) *
    PRODUCTS_PER_PAGE;

  const response = await fetch(
    `${apiUrl}/products/category/${encodedCategory}?limit=${PRODUCTS_PER_PAGE}&skip=${skip}`,
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
      `Failed to fetch category products: ${response.status}`
    );
  }

  const data: CategoryProductsResponse =
    await response.json();

  if (!data.success) {
    return null;
  }

  return data;
}

async function categoryExists(
  category: string
): Promise<boolean> {
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const response = await fetch(
    `${apiUrl}/products/category/${encodeURIComponent(
      category
    )}?limit=1&skip=0`,
    {
      next: {
        revalidate: 300,
      },
    }
  );

  if (!response.ok) {
    return false;
  }

  const data: CategoryProductsResponse =
    await response.json();

  return Boolean(
    data.success &&
      data.pagination.totalProducts > 0
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { page: pageParam } =
    await searchParams;

  const normalizedCategory =
    normalizeCategory(category);

  const categoryName =
    formatCategoryName(
      normalizedCategory
    );

  const page = parsePage(pageParam);

  const canonicalPath =
    page === 1
      ? `/categories/${encodeURIComponent(
          normalizedCategory
        )}`
      : `/categories/${encodeURIComponent(
          normalizedCategory
        )}?page=${page}`;

  const title =
    page === 1
      ? `${categoryName} Products`
      : `${categoryName} Products - Page ${page}`;

  const description =
    page === 1
      ? `Explore ${categoryName} products on ShopCart. Browse products, compare prices, and find the right products for you.`
      : `Browse page ${page} of ${categoryName} products on ShopCart.`;

  const exists =
    await categoryExists(
      normalizedCategory
    );

  if (!exists) {
    return {
      title: "Category Not Found",
      description:
        "The requested product category could not be found on ShopCart.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title,
    description,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      title: `${title} | ShopCart`,
      description,
      url: canonicalPath,
      siteName: "ShopCart",
      locale: "en_IN",
    },

    twitter: {
      card: "summary",
      title: `${title} | ShopCart`,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { page: pageParam } =
    await searchParams;

  const normalizedCategory =
    normalizeCategory(category);

  if (!normalizedCategory) {
    notFound();
  }

  const page = parsePage(pageParam);

  const data =
    await getCategoryProducts(
      normalizedCategory,
      page
    );

  if (!data) {
    notFound();
  }

  const totalPages =
    data.pagination.totalPages;

  /*
   * A valid category can still receive an
   * invalid page number.
   */
  if (
    page > totalPages &&
    totalPages > 0
  ) {
    notFound();
  }

  const categoryName =
    formatCategoryName(
      normalizedCategory
    );

  const productUrls =
    data.products.map(
      (product) =>
        `${siteUrl}/products/${encodeURIComponent(
          product._id
        )}`
    );

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} Products`,
    numberOfItems:
      data.products.length,

    itemListElement:
      data.products.map(
        (product, index) => ({
          "@type": "ListItem",
          position:
            (page - 1) *
              PRODUCTS_PER_PAGE +
            index +
            1,
          name: product.title,
          url: productUrls[index],
        })
      ),
  };

  const breadcrumbJsonLd = {
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
        name: categoryName,
        item: `${siteUrl}/categories/${encodeURIComponent(
          normalizedCategory
        )}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <main className="products-page">
        <div className="container">
          <nav
            className="product-breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">
              Home
            </a>

            <span aria-hidden="true">
              /
            </span>

            <a href="/products">
              Products
            </a>

            <span aria-hidden="true">
              /
            </span>

            <span aria-current="page">
              {categoryName}
            </span>
          </nav>

          <section className="products-page-header">
            <div>
              <span className="section-eyebrow">
                ShopCart Collection
              </span>

              <h1 className="products-page-title">
                {categoryName} Products
              </h1>

              <p className="products-page-description">
                Explore our collection of{" "}
                {categoryName.toLowerCase()}{" "}
                products on ShopCart.
                Compare products and find
                what you need.
              </p>
            </div>

            <div className="products-page-count">
              <span>
                {data.pagination.totalProducts}{" "}
                products
              </span>
            </div>
          </section>

          <ProductGrid
            products={data.products}
            isLoading={false}
            isFetching={false}
          />

          {totalPages > 1 && (
            <nav
              className="product-pagination"
              aria-label={`${categoryName} pagination`}
            >
              {page > 1 && (
                <a
                  className="pagination-button"
                  href={
                    page === 2
                      ? `/categories/${encodeURIComponent(
                          normalizedCategory
                        )}`
                      : `/categories/${encodeURIComponent(
                          normalizedCategory
                        )}?page=${
                          page - 1
                        }`
                  }
                >
                  Previous
                </a>
              )}

              <span
                aria-current="page"
                className="pagination-button active"
              >
                Page {page} of{" "}
                {totalPages}
              </span>

              {page < totalPages && (
                <a
                  className="pagination-button"
                  href={`/categories/${encodeURIComponent(
                    normalizedCategory
                  )}?page=${
                    page + 1
                  }`}
                >
                  Next
                </a>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}


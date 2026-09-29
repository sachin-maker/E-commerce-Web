
import type { MetadataRoute } from "next";
import type { Product } from "@/app/types/product";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopcart.com";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL;

const PRODUCTS_PER_PAGE = 50;

interface ProductsApiResponse {
  success: boolean;
  products: Product[];
  pagination: {
    currentPage: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

interface CategoriesApiResponse {
  success: boolean;
  categories: string[];
}

async function getProductPage(
  page: number
): Promise<ProductsApiResponse> {
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const response = await fetch(
    `${apiUrl}/products?limit=${PRODUCTS_PER_PAGE}&page=${page}&sort=default`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap products: ${response.status}`
    );
  }

  const data: ProductsApiResponse =
    await response.json();

  if (!data.success) {
    throw new Error(
      "Product API returned an unsuccessful response"
    );
  }

  return data;
}

async function getCategories(): Promise<
  string[]
> {
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const response = await fetch(
    `${apiUrl}/products/categories`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap categories: ${response.status}`
    );
  }

  const data: CategoriesApiResponse =
    await response.json();

  if (!data.success) {
    throw new Error(
      "Category API returned an unsuccessful response"
    );
  }

  return data.categories;
}

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  /*
   * Fetch categories and products independently.
   *
   * If one fails, we still keep the other
   * sitemap entries available.
   */
  let categoryUrls: MetadataRoute.Sitemap = [];
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const categories =
      await getCategories();

    categoryUrls = categories
      .filter(
        (category) =>
          typeof category === "string" &&
          category.trim().length > 0
      )
      .map((category) => {
        const normalizedCategory =
          category.trim().toLowerCase();

        return {
          url: `${siteUrl}/categories/${encodeURIComponent(
            normalizedCategory
          )}`,
          changeFrequency: "daily",
          priority: 0.85,
        };
      });
  } catch (error) {
    console.error(
      "Category sitemap generation failed:",
      error
    );
  }

  try {
    const firstPage =
      await getProductPage(1);

    const products: Product[] = [
      ...firstPage.products,
    ];

    const totalPages =
      firstPage.pagination.totalPages;

    const remainingPages = Array.from(
      {
        length: Math.max(
          totalPages - 1,
          0
        ),
      },
      (_, index) => index + 2
    );

    const BATCH_SIZE = 5;

    for (
      let index = 0;
      index < remainingPages.length;
      index += BATCH_SIZE
    ) {
      const batch =
        remainingPages.slice(
          index,
          index + BATCH_SIZE
        );

      const responses =
        await Promise.all(
          batch.map((page) =>
            getProductPage(page)
          )
        );

      for (const response of responses) {
        if (response.products.length > 0) {
          products.push(
            ...response.products
          );
        }
      }
    }

    productUrls = products
      .filter(
        (product) =>
          Boolean(product?._id) &&
          Boolean(product?.title)
      )
      .map((product) => ({
        url: `${siteUrl}/products/${encodeURIComponent(
          product._id
        )}`,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (error) {
    console.error(
      "Product sitemap generation failed:",
      error
    );
  }

  return [
    ...staticPages,
    ...categoryUrls,
    ...productUrls,
  ];
}



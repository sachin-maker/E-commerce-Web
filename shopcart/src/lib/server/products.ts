import type {
  Product,
  ProductsResponse,
} from "@/app/types/product";

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

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const response = await fetch(
    `${apiUrl}/products?limit=8`,
    {
      next: {
        revalidate: 300,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch featured products: ${response.status}`
    );
  }

  const data: ProductsApiResponse =
    await response.json();

  if (!data.success) {
    throw new Error(
      "Product API returned an unsuccessful response"
    );
  }

  return data.products;
}

import { apiRequest } from "@/lib/api";

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total?: number;
  page?: number;
  pages?: number;
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

export interface CategoriesResponse {
  success: boolean;
  categories: string[];
}

export interface ProductSearchResponse {
  success: boolean;
  products: Product[];
  total?: number;
}

export const getProducts = async (): Promise<ProductsResponse> => {
  return apiRequest<ProductsResponse>("/products");
};

export const getProductById = async (
  productId: string
): Promise<ProductResponse> => {
  return apiRequest<ProductResponse>(`/products/${productId}`);
};

export const getProductCategories =
  async (): Promise<CategoriesResponse> => {
    return apiRequest<CategoriesResponse>("/products/categories");
  };

  export const searchProducts = async (
  query: string
): Promise<ProductSearchResponse> => {
  return apiRequest<ProductSearchResponse>(
    `/products/search?q=${encodeURIComponent(query)}`
  );
};
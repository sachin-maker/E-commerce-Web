import type {
  Product,
  ProductsResponse,
} from "@/app/types/product";

import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

interface ProductQueryParams {
  limit?: number;
  skip?: number;
  category?: string;
}

interface SearchProductParams extends ProductQueryParams {
  query: string;
}

interface CategoryProductParams extends ProductQueryParams {
  category: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const dummyJsonApi = createApi({
  reducerPath: "dummyJsonApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),

  tagTypes: ["Products", "Product"],

  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 60,

  endpoints: (builder) => ({
    getProducts: builder.query<
  ProductsResponse,
  ProductQueryParams | void
>({
  query: (params) => {
    const limit = params?.limit ?? 12;
    const skip = params?.skip ?? 0;
    const category = params?.category ?? "";

    const queryParams = new URLSearchParams({
      limit: String(limit),
      skip: String(skip),
    });

    if (category) {
      queryParams.append("category", category);
    }

    return `/products?${queryParams.toString()}`;
  },

  transformResponse: (response: {
    success: boolean;
    products: Product[];
    pagination: {
      currentPage: number;
      limit: number;
      totalProducts: number;
      totalPages: number;
    };
  }): ProductsResponse => {
    return {
      products: response.products,
      total: response.pagination.totalProducts,
      skip:
        (response.pagination.currentPage - 1) *
        response.pagination.limit,
      limit: response.pagination.limit,
    };
  },

  providesTags: ["Products"],
}),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,

      transformResponse: (response: {
        success: boolean;
        product: Product;
      }) => response.product,

      providesTags: (_result, _error, id) => [
        {
          type: "Product",
          id,
        },
      ],
    }),

    getFeaturedProducts: builder.query<
      ProductsResponse,
      void
    >({
      query: () => "/products?limit=8",
      providesTags: ["Products"],
    }),

    getProductsByCategory: builder.query<
      ProductsResponse,
      CategoryProductParams
    >({
      query: ({ category, limit = 12, skip = 0 }) => {
        return `/products/category/${encodeURIComponent(
          category
        )}?limit=${limit}&skip=${skip}`;
      },

      providesTags: ["Products"],
    }),

    searchProducts: builder.query<
  ProductsResponse,
  SearchProductParams
>({
  query: ({ query, limit = 12, skip = 0 }) => {
    const queryParams = new URLSearchParams({
      search: query.trim(),
      limit: String(limit),
      skip: String(skip),
    });

    return `/products?${queryParams.toString()}`;
  },

  transformResponse: (response: {
    success: boolean;
    products: Product[];
    pagination: {
      currentPage: number;
      limit: number;
      totalProducts: number;
      totalPages: number;
    };
  }): ProductsResponse => {
    return {
      products: response.products,
      total: response.pagination.totalProducts,
      skip:
        (response.pagination.currentPage - 1) *
        response.pagination.limit,
      limit: response.pagination.limit,
    };
  },

  providesTags: ["Products"],
}),

    getCategories: builder.query<string[], void>({
      query: () => "/products/categories",

      transformResponse: (response: {
        success: boolean;
        categories: string[];
      }) => response.categories,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useGetCategoriesQuery,
} = dummyJsonApi;
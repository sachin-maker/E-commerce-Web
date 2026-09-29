
import type {
  Product,
  ProductsResponse,
} from "@/app/types/product";

import { baseApi } from "./baseApi";

interface ProductQueryParams {
  limit?: number;
  skip?: number;
  category?: string;
  search?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string;
}



interface CategoryProductParams
  extends ProductQueryParams {
  category: string;
}

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

const transformProductsResponse = (
  response: ProductsApiResponse
): ProductsResponse => {
  return {
    products: response.products,
    total: response.pagination.totalProducts,
    skip:
      (response.pagination.currentPage - 1) *
      response.pagination.limit,
    limit: response.pagination.limit,
  };
};

export const productApi  =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getProducts: builder.query<
        ProductsResponse,
        ProductQueryParams | void
      >({
        query: (params) => {
          const limit =
            params?.limit ?? 12;

          const skip =
            params?.skip ?? 0;

          const queryParams =
            new URLSearchParams({
              limit: String(limit),
              skip: String(skip),
            });

          if (params?.search?.trim()) {
            queryParams.set(
              "search",
              params.search.trim()
            );
          }

          if (params?.category) {
            queryParams.set(
              "category",
              params.category
            );
          }

          if (
            params?.minPrice !== null &&
            params?.minPrice !== undefined
          ) {
            queryParams.set(
              "minPrice",
              String(params.minPrice)
            );
          }

          if (
            params?.maxPrice !== null &&
            params?.maxPrice !== undefined
          ) {
            queryParams.set(
              "maxPrice",
              String(params.maxPrice)
            );
          }

          if (params?.sort) {
            queryParams.set(
              "sort",
              params.sort
            );
          }

          return `/products?${queryParams.toString()}`;
        },

        transformResponse:
          transformProductsResponse,

        providesTags: ["Products"],
      }),

      getProductById: builder.query<
        Product,
        string
      >({
        query: (id) =>
          `/products/${id}`,

        transformResponse: (response: {
          success: boolean;
          product: Product;
        }) => response.product,

        providesTags: (
          _result,
          _error,
          id
        ) => [
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
        query: () =>
          "/products?limit=8",

        transformResponse:
          transformProductsResponse,

        providesTags: ["Products"],
      }),

      getProductsByCategory:
        builder.query<
          ProductsResponse,
          CategoryProductParams
        >({
          query: ({
            category,
            limit = 12,
            skip = 0,
            minPrice,
            maxPrice,
            sort,
            search,
          }) => {
            const queryParams =
              new URLSearchParams({
                limit: String(limit),
                skip: String(skip),
              });

            if (search?.trim()) {
              queryParams.set(
                "search",
                search.trim()
              );
            }

            if (minPrice !== null &&
                minPrice !== undefined) {
              queryParams.set(
                "minPrice",
                String(minPrice)
              );
            }

            if (maxPrice !== null &&
                maxPrice !== undefined) {
              queryParams.set(
                "maxPrice",
                String(maxPrice)
              );
            }

            if (sort) {
              queryParams.set(
                "sort",
                sort
              );
            }

            return `/products/category/${encodeURIComponent(
              category
            )}?${queryParams.toString()}`;
          },

          transformResponse:
            transformProductsResponse,

          providesTags: ["Products"],
        }),

    

      getCategories: builder.query<
        string[],
        void
      >({
        query: () =>
          "/products/categories",

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
  
  useGetCategoriesQuery,
} = productApi;



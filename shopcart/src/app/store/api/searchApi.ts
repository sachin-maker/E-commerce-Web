import { baseApi } from "./baseApi";

import type { Product } from "@/app/types/product";

export interface SearchProduct extends Product {
  score?: number;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  brand?: string;
  category: string;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
}

export interface SearchProductsParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface SearchProductsResponse {
  success: boolean;
  products: SearchProduct[];
  pagination: SearchPagination;
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSearchSuggestions: builder.query<
      SearchSuggestionsResponse,
      {
        q: string;
        limit?: number;
      }
    >({
      query: ({ q, limit = 8 }) => ({
        url: "/search/suggestions",
        params: {
          q,
          limit,
        },
      }),
      providesTags: ["Search"],
    }),

    getSearchProducts: builder.query<
      SearchProductsResponse,
      SearchProductsParams
    >({
      query: ({
        q = "",
        category,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        page = 1,
        limit = 20,
        sort = "relevance",
      }) => ({
        url: "/search",
        params: {
          q,
          category,
          minPrice,
          maxPrice,
          minRating,
          inStock,
          page,
          limit,
          sort,
        },
      }),
      providesTags: ["Search"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSearchSuggestionsQuery,
  useGetSearchProductsQuery,
} = searchApi;
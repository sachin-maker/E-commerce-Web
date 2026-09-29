
"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import useDebounce from "@/app/hooks/useDebounce";

import {
  AlertCircle,
  PackageSearch,
  RefreshCw,
} from "lucide-react";

import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/app/store/api/productApi";

import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import ProductPagination from "./ProductPagination";

const PRODUCTS_PER_PAGE = 12;

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "name-asc"
  | "name-desc";

const VALID_SORT_OPTIONS: SortOption[] = [
  "default",
  "price-low",
  "price-high",
  "rating-high",
  "name-asc",
  "name-desc",
];

const isValidSortOption = (
  value: string
): value is SortOption => {
  return VALID_SORT_OPTIONS.includes(
    value as SortOption
  );
};

const parsePrice = (
  value: string | null
): number | null => {
  if (value === null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
};

const parsePage = (
  value: string | null
): number => {
  if (value === null || value.trim() === "") {
    return 1;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return 1;
  }

  return parsed;
};

export default function ProductsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * Read the current URL state.
   *
   * URL is the source of truth for:
   * - search
   * - category
   * - sorting
   * - price range
   * - pagination
   */
  const urlSearchTerm =
    searchParams.get("search") ?? "";

  const urlCategory =
    searchParams.get("category") ?? "";

  const urlSort = searchParams.get("sort");

  const urlMinPrice = parsePrice(
    searchParams.get("minPrice")
  );

  const urlMaxPrice = parsePrice(
    searchParams.get("maxPrice")
  );

  const currentPage = parsePage(
    searchParams.get("page")
  );

  const selectedSort: SortOption =
    urlSort && isValidSortOption(urlSort)
      ? urlSort
      : "default";

  const selectedCategory =
    urlCategory.trim() || "all";

  const [searchTerm, setSearchTerm] =
    useState(urlSearchTerm);

  const [minPrice, setMinPrice] =
    useState<number | null>(urlMinPrice);

  const [maxPrice, setMaxPrice] =
    useState<number | null>(urlMaxPrice);

  const [sortBy, setSortBy] =
    useState<SortOption>(selectedSort);

  const debouncedSearchTerm =
    useDebounce(searchTerm, 400);

  const normalizedSearchTerm =
    debouncedSearchTerm.trim();

  const isSearchPending =
    searchTerm.trim() !==
    normalizedSearchTerm;

  const isPriceRangeValid =
    (minPrice === null || minPrice >= 0) &&
    (maxPrice === null || maxPrice >= 0) &&
    (minPrice === null ||
      maxPrice === null ||
      minPrice <= maxPrice);

  /*
   * Keep local search/filter state synchronized
   * when the URL changes through browser
   * navigation, back/forward, or another
   * component.
   */
  useEffect(() => {
    setSearchTerm(urlSearchTerm);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setSortBy(selectedSort);
  }, [
    urlSearchTerm,
    urlMinPrice,
    urlMaxPrice,
    selectedSort,
  ]);

  /*
   * Fetch categories.
   */
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useGetCategoriesQuery();

  /*
   * Fetch products.
   *
   * The backend remains responsible for:
   * - filtering
   * - sorting
   * - search relevance
   * - pagination
   */
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProductsQuery(
    {
      limit: PRODUCTS_PER_PAGE,

      skip:
        (currentPage - 1) *
        PRODUCTS_PER_PAGE,

      search: normalizedSearchTerm,

      category:
        selectedCategory === "all"
          ? ""
          : selectedCategory,

      minPrice,
      maxPrice,

      sort:
        normalizedSearchTerm &&
        sortBy === "default"
          ? "relevance"
          : sortBy,
    },
    {
      skip: !isPriceRangeValid,
    }
  );

  /*
   * Create a new URL while preserving
   * unrelated query parameters.
   */
  const updateUrl = (
    updates: Record<
      string,
      string | number | null | undefined
    >
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
    );

    const queryString = params.toString();

    router.replace(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      }
    );
  };

  /*
   * Search handler.
   *
   * Search is stored in the URL immediately,
   * while the API remains protected by the
   * existing debounce.
   */
  const handleSearchChange = (
    value: string
  ) => {
    setSearchTerm(value);

    const trimmedValue = value.trim();

    updateUrl({
      search: trimmedValue || null,
      category: trimmedValue
        ? null
        : selectedCategory !== "all"
          ? selectedCategory
          : null,
      page: null,
    });
  };

  /*
   * Category handler.
   */
  const handleCategoryChange = (
    value: string
  ) => {
    const normalizedCategory =
      value === "all" ? null : value;

    setSearchTerm(
      normalizedCategory ? "" : searchTerm
    );

    updateUrl({
      category: normalizedCategory,
      search: normalizedCategory
        ? null
        : searchTerm.trim() || null,
      page: null,
    });
  };

  /*
   * Sort handler.
   */
  const handleSortChange = (
    value: string
  ) => {
    if (!isValidSortOption(value)) {
      return;
    }

    setSortBy(value);

    updateUrl({
      sort:
        value === "default"
          ? null
          : value,
      page: null,
    });
  };

  /*
   * Minimum price handler.
   */
  const handleMinPriceChange = (
    value: number | null
  ) => {
    setMinPrice(value);

    updateUrl({
      minPrice: value,
      page: null,
    });
  };

  /*
   * Maximum price handler.
   */
  const handleMaxPriceChange = (
    value: number | null
  ) => {
    setMaxPrice(value);

    updateUrl({
      maxPrice: value,
      page: null,
    });
  };

  /*
   * Clear all filters.
   */
  const handleClearFilters = () => {
    setSearchTerm("");
    setMinPrice(null);
    setMaxPrice(null);
    setSortBy("default");

    router.replace(pathname, {
      scroll: false,
    });
  };

  /*
   * Pagination handler.
   *
   * Page 1 uses the clean canonical path:
   *
   * /products
   *
   * Other pages use:
   *
   * /products?page=2
   */
  const handlePageChange = (
    page: number
  ) => {
    const totalPages = Math.ceil(
      (data?.total ?? 0) /
        PRODUCTS_PER_PAGE
    );

    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    updateUrl({
      page: page === 1 ? null : page,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const products =
    data?.products ?? [];

  const totalProducts =
    data?.total ?? 0;

  const totalPages = Math.ceil(
    totalProducts /
      PRODUCTS_PER_PAGE
  );

  const pageStart =
    totalProducts > 0
      ? (currentPage - 1) *
          PRODUCTS_PER_PAGE +
        1
      : 0;

  const pageEnd =
    Math.min(
      (currentPage - 1) *
        PRODUCTS_PER_PAGE +
        PRODUCTS_PER_PAGE,
      totalProducts
    );

  const isUpdating =
    isFetching && !isLoading;

  /*
   * If a URL contains a page number larger
   * than the available number of pages,
   * return the user to the last valid page.
   */
  useEffect(() => {
    if (
      !isLoading &&
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      updateUrl({
        page:
          totalPages === 1
            ? null
            : totalPages,
      });
    }
  }, [
    currentPage,
    totalPages,
    isLoading,
  ]);

  return (
    <main className="products-page">
      <div className="container">
        <section className="products-page-header">
          <div>
            <span className="section-eyebrow">
              ShopCart Collection
            </span>

            <h1 className="products-page-title">
              Explore Our Products
            </h1>

            <p className="products-page-description">
              Discover quality products at
              great prices. Find everything
              you need in one place.
            </p>
          </div>

          <div className="products-page-count">
            <PackageSearch
              size={20}
              aria-hidden="true"
            />

            <span>
              {totalProducts} products
            </span>
          </div>
        </section>

        <ProductFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          minPrice={minPrice}
          maxPrice={maxPrice}
          categories={categories}
          onSearchChange={
            handleSearchChange
          }
          onCategoryChange={
            handleCategoryChange
          }
          onSortChange={
            handleSortChange
          }
          onMinPriceChange={
            handleMinPriceChange
          }
          onMaxPriceChange={
            handleMaxPriceChange
          }
          onClearFilters={
            handleClearFilters
          }
        />

        {!isPriceRangeValid && (
          <p
            className="price-filter-error"
            role="alert"
          >
            Minimum price cannot be greater
            than maximum price.
          </p>
        )}

        {isCategoriesLoading && (
          <p
            className="categories-loading-text"
            aria-live="polite"
          >
            Loading categories...
          </p>
        )}

        {isError && (
          <section
            className="products-state error-state"
            role="alert"
          >
            <AlertCircle
              size={42}
              aria-hidden="true"
            />

            <h2>
              Unable to load products
            </h2>

            <p>
              Something went wrong while
              loading the products. Please
              try again.
            </p>

            <button
              type="button"
              className="state-action-button"
              onClick={() => refetch()}
            >
              <RefreshCw
                size={17}
                aria-hidden="true"
              />

              Try Again
            </button>
          </section>
        )}

        {!isError &&
          isPriceRangeValid &&
          !isLoading &&
          products.length === 0 && (
            <section
              className="products-state empty-state"
              aria-live="polite"
            >
              <PackageSearch
                size={48}
                aria-hidden="true"
              />

              <h2>
                No products found
              </h2>

              <p>
                Try another search term or
                change your filters to find
                more products.
              </p>

              <button
                type="button"
                className="state-action-button"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>
            </section>
          )}

        {!isError &&
          isPriceRangeValid &&
          products.length > 0 && (
            <>
              <div className="products-result-toolbar">
                <p>
                  Showing{" "}
                  <strong>
                    {pageStart}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    {pageEnd}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalProducts}
                  </strong>{" "}
                  products
                </p>

                {(isSearchPending ||
                  isUpdating) && (
                  <span
                    className="products-fetching-text"
                    aria-live="polite"
                  >
                    {isSearchPending
                      ? "Searching..."
                      : "Updating products..."}
                  </span>
                )}
              </div>

              <ProductGrid
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
              />

              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={
                  handlePageChange
                }
              />
            </>
          )}
      </div>
    </main>
  );
}



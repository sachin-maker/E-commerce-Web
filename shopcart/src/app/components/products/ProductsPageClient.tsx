"use client";

import { useEffect, useMemo, useState } from "react";
import useDebounce from "@/app/hooks/useDebounce";
import {
  AlertCircle,
  PackageSearch,
  RefreshCw,
} from "lucide-react";

import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from "@/app/store/api/dummyJsonApi";

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

export default function ProductsPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState<SortOption>("default");

  const [minPrice, setMinPrice] =
    useState<number | null>(null);

  const [maxPrice, setMaxPrice] =
    useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebounce(
    searchTerm,
    400
  );

  const skip =
    (currentPage - 1) * PRODUCTS_PER_PAGE;

  const isSearching =
    debouncedSearchTerm.trim().length > 0;

  const isSearchPending =
    searchTerm.trim() !==
    debouncedSearchTerm.trim();

  const isCategorySelected =
    selectedCategory !== "all";

  const isPriceRangeValid =
    (minPrice === null || minPrice >= 0) &&
    (maxPrice === null || maxPrice >= 0) &&
    (minPrice === null ||
      maxPrice === null ||
      minPrice <= maxPrice);

  /*
   * Fetch categories
   */
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useGetCategoriesQuery();

  /*
   * Fetch all products or products by category.
   *
   * When selectedCategory is "all":
   * /products?limit=12&skip=0
   *
   * When selectedCategory is "electronics":
   * /products?limit=12&skip=0&category=electronics
   */
  const productsQuery = useGetProductsQuery({
    limit: PRODUCTS_PER_PAGE,
    skip,
    category:
      selectedCategory === "all"
        ? ""
        : selectedCategory,
  });

  /*
   * Fetch searched products.
   */
  const searchQuery = useSearchProductsQuery(
    {
      query: debouncedSearchTerm.trim(),
      limit: PRODUCTS_PER_PAGE,
      skip,
    },
    {
      skip: !isSearching,
    }
  );

  /*
   * Use search results when searching.
   * Otherwise use all/category products.
   */
  const activeQuery = isSearching
    ? searchQuery
    : productsQuery;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = activeQuery;

  const products = useMemo(
    () => data?.products ?? [],
    [data?.products]
  );

  /*
   * Apply price filtering on the frontend.
   */
  const priceFilteredProducts = useMemo(() => {
    if (!isPriceRangeValid) {
      return [];
    }

    return products.filter((product) => {
      const price = product.price;

      const matchesMinPrice =
        minPrice === null ||
        price >= minPrice;

      const matchesMaxPrice =
        maxPrice === null ||
        price <= maxPrice;

      return (
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [
    products,
    minPrice,
    maxPrice,
    isPriceRangeValid,
  ]);

  /*
   * Total products comes from the backend response.
   */
  const totalProducts =
    data?.total ??
    data?.products?.length ??
    0;

  const totalPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  /*
   * Apply sorting on the frontend.
   */
  const sortedProducts = useMemo(() => {
    const productsCopy = [
      ...priceFilteredProducts,
    ];

    switch (sortBy) {
      case "price-low":
        return productsCopy.sort(
          (a, b) => a.price - b.price
        );

      case "price-high":
        return productsCopy.sort(
          (a, b) => b.price - a.price
        );

      case "rating-high":
        return productsCopy.sort(
          (a, b) => b.rating - a.rating
        );

      case "name-asc":
        return productsCopy.sort((a, b) =>
          a.title.localeCompare(b.title)
        );

      case "name-desc":
        return productsCopy.sort((a, b) =>
          b.title.localeCompare(a.title)
        );

      default:
        return productsCopy;
    }
  }, [
    priceFilteredProducts,
    sortBy,
  ]);

  /*
   * Reset pagination when filters change.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    minPrice,
    maxPrice,
  ]);

  /*
   * Search handler.
   */
  const handleSearchChange = (
    value: string
  ) => {
    setSearchTerm(value);
    setCurrentPage(1);

    if (value.trim()) {
      setSelectedCategory("all");
    }
  };

  /*
   * Category handler.
   */
  const handleCategoryChange = (
    value: string
  ) => {
    setSelectedCategory(value);
    setCurrentPage(1);

    if (value !== "all") {
      setSearchTerm("");
    }
  };

  /*
   * Sort handler.
   */
  const handleSortChange = (
    value: string
  ) => {
    setSortBy(value as SortOption);
  };

  /*
   * Clear all filters.
   */
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("default");
    setMinPrice(null);
    setMaxPrice(null);
    setCurrentPage(1);
  };

  /*
   * Pagination handler.
   */
  const handlePageChange = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
              Discover quality products at great
              prices. Find everything you need in
              one place.
            </p>
          </div>

          <div className="products-page-count">
            <PackageSearch size={20} />

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
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onClearFilters={handleClearFilters}
        />

        {!isPriceRangeValid && (
          <p className="price-filter-error">
            Minimum price cannot be greater than
            maximum price.
          </p>
        )}

        {isCategoriesLoading && (
          <p className="categories-loading-text">
            Loading categories...
          </p>
        )}

        {isError && (
          <section className="products-state error-state">
            <AlertCircle size={42} />

            <h2>
              Unable to load products
            </h2>

            <p>
              Something went wrong while loading
              the products. Please try again.
            </p>

            <button
              type="button"
              className="state-action-button"
              onClick={() => refetch()}
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </section>
        )}

        {!isError &&
          !isLoading &&
          sortedProducts.length === 0 && (
            <section className="products-state empty-state">
              <PackageSearch size={48} />

              <h2>
                No products found
              </h2>

              <p>
                Try another search term or change
                your filters to find more products.
              </p>

              <button
                type="button"
                className="state-action-button"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </section>
          )}

        {!isError &&
          sortedProducts.length > 0 && (
            <>
              <div className="products-result-toolbar">
                <p>
                  Showing{" "}
                  <strong>
                    {skip + 1}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    {Math.min(
                      skip + PRODUCTS_PER_PAGE,
                      totalProducts
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalProducts}
                  </strong>{" "}
                  products
                </p>

                {(isSearchPending ||
                  (isFetching && !isLoading)) && (
                  <span className="products-fetching-text">
                    {isSearchPending
                      ? "Searching..."
                      : "Updating products..."}
                  </span>
                )}
              </div>

              <ProductGrid
                products={sortedProducts}
                isLoading={isLoading}
                isFetching={isFetching}
              />

              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
      </div>
    </main>
  );
}
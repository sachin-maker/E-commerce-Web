"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "next/navigation";

import ProductCard from "@/app/components/home/ProductCard";
import {
    useGetSearchProductsQuery,
    type SearchProductsParams,
    type SearchProduct,
} from "@/app/store/api/searchApi";

import "./SearchPage.css";

const PRODUCTS_PER_PAGE = 20;
const INITIAL_PAGE = 1;
const LOAD_MORE_ROOT_MARGIN = "400px";

const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "newest", label: "Newest" },
];

export default function SearchPage() {
    const searchParams = useSearchParams();

    const query = searchParams.get("q")?.trim() ?? "";

    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [inStock, setInStock] = useState(false);
    const [sort, setSort] = useState("relevance");

    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [page, setPage] = useState(INITIAL_PAGE);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    /*
     * Identifies the actual search/filter configuration.
     *
     * When this changes, accumulated results must be discarded
     * because they belong to a different query.
     */
    const searchKey = useMemo(
        () =>
            JSON.stringify({
                query,
                category,
                minPrice,
                maxPrice,
                minRating,
                inStock,
                sort,
            }),
        [
            query,
            category,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            sort,
        ]
    );

    const previousSearchKeyRef = useRef(searchKey);

    const searchQuery = useMemo<SearchProductsParams>(
        () => ({
            q: query,
            category: category || undefined,
            minPrice:
                minPrice !== "" ? Number(minPrice) : undefined,
            maxPrice:
                maxPrice !== "" ? Number(maxPrice) : undefined,
            minRating:
                minRating !== "" ? Number(minRating) : undefined,
            inStock,
            page,
            limit: PRODUCTS_PER_PAGE,
            sort,
        }),
        [
            query,
            category,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            page,
            sort,
        ]
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetSearchProductsQuery(searchQuery);

    /*
     * Reset accumulated products whenever the actual
     * search/filter configuration changes.
     */
    useEffect(() => {
        if (previousSearchKeyRef.current === searchKey) {
            return;
        }

        previousSearchKeyRef.current = searchKey;

        setProducts([]);
        setPage(INITIAL_PAGE);
    }, [searchKey]);

    /*
     * Handle search results.
     *
     * Page 1 always REPLACES the accumulated list.
     *
     * This is important when RTK Query refetches page 1 after
     * Search cache invalidation. It ensures updated products
     * replace stale products already stored locally.
     *
     * Pages 2+ are appended for infinite scrolling.
     */
    useEffect(() => {
        if (!data?.products) {
            return;
        }

        if (page === INITIAL_PAGE) {
            setProducts(data.products);
            return;
        }

        if (data.products.length === 0) {
            return;
        }

        setProducts((currentProducts) => {
            const existingIds = new Set(
                currentProducts.map((product) => product._id)
            );

            const newProducts = data.products.filter(
                (product) => !existingIds.has(product._id)
            );

            if (newProducts.length === 0) {
                return currentProducts;
            }

            return [...currentProducts, ...newProducts];
        });
    }, [data, page]);

    /*
     * Load the next page only when:
     * - another page exists
     * - no request is currently running
     */
    const loadNextPage = useCallback(() => {
        if (!data?.pagination?.hasNextPage) {
            return;
        }

        if (isFetching) {
            return;
        }

        setPage((currentPage) => currentPage + 1);
    }, [data?.pagination?.hasNextPage, isFetching]);

    /*
     * IntersectionObserver for infinite scrolling.
     */
    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];

                if (firstEntry?.isIntersecting) {
                    loadNextPage();
                }
            },
            {
                root: null,
                rootMargin: LOAD_MORE_ROOT_MARGIN,
                threshold: 0,
            }
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [loadNextPage]);

    /*
     * Clear all filters.
     */
    const clearFilters = useCallback(() => {
        setCategory("");
        setMinPrice("");
        setMaxPrice("");
        setMinRating("");
        setInStock(false);
        setSort("relevance");
    }, []);

    /*
     * Validate price range before displaying results.
     */
    const hasInvalidPriceRange =
        minPrice !== "" &&
        maxPrice !== "" &&
        Number(minPrice) > Number(maxPrice);

    const isInitialLoading =
        isLoading && products.length === 0;

    const isLoadingMore =
        isFetching && products.length > 0;

    const hasMore =
        Boolean(data?.pagination?.hasNextPage);

    /*
     * Avoid showing "No products" while the first request
     * is still loading.
     */
    const showEmptyState =
        !isInitialLoading &&
        !isError &&
        !hasInvalidPriceRange &&
        products.length === 0;

    return (
        <main className="search-page">
            <div className="search-page-container">
                <header className="search-page-header">
                    <div>
                        <h1>Search Results</h1>

                        {query ? (
                            <p>
                                Results for{" "}
                                <strong>&quot;{query}&quot;</strong>
                            </p>
                        ) : (
                            <p>All products</p>
                        )}
                    </div>

                    {data?.pagination && (
                        <span className="search-result-count">
                            {data.pagination.total} products
                        </span>
                    )}
                </header>

                <div className="search-page-layout">
                    <aside className="search-filters">
                        <div className="search-filters-header">
                            <h2>Filters</h2>

                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="search-filter-group">
                            <label htmlFor="search-category">
                                Category
                            </label>

                            <select
                                id="search-category"
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                            >
                                <option value="">
                                    All Categories
                                </option>

                                <option value="beauty">Beauty</option>
                                <option value="fragrances">
                                    Fragrances
                                </option>
                                <option value="furniture">
                                    Furniture
                                </option>
                                <option value="groceries">
                                    Groceries
                                </option>
                                <option value="home-decoration">
                                    Home Decoration
                                </option>
                                <option value="kitchen-accessories">
                                    Kitchen Accessories
                                </option>
                                <option value="laptops">
                                    Laptops
                                </option>
                                <option value="mens-shirts">
                                    Men&apos;s Shirts
                                </option>
                                <option value="mens-shoes">
                                    Men&apos;s Shoes
                                </option>
                                <option value="mens-watches">
                                    Men&apos;s Watches
                                </option>
                                <option value="mobile-accessories">
                                    Mobile Accessories
                                </option>
                                <option value="motorcycle">
                                    Motorcycle
                                </option>
                                <option value="skin-care">
                                    Skin Care
                                </option>
                                <option value="smartphones">
                                    Smartphones
                                </option>
                                <option value="sports-accessories">
                                    Sports Accessories
                                </option>
                                <option value="sunglasses">
                                    Sunglasses
                                </option>
                                <option value="tablets">Tablets</option>
                                <option value="tops">Tops</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="womens-bags">
                                    Women&apos;s Bags
                                </option>
                                <option value="womens-dresses">
                                    Women&apos;s Dresses
                                </option>
                                <option value="womens-jewellery">
                                    Women&apos;s Jewellery
                                </option>
                                <option value="womens-shoes">
                                    Women&apos;s Shoes
                                </option>
                                <option value="womens-watches">
                                    Women&apos;s Watches
                                </option>
                            </select>
                        </div>

                        <div className="search-filter-group">
                            <span>Price</span>

                            <div className="price-inputs">
                                <input
                                    type="number"
                                    min="0"
                                    value={minPrice}
                                    onChange={(event) =>
                                        setMinPrice(event.target.value)
                                    }
                                    placeholder="Min"
                                    aria-label="Minimum price"
                                    aria-invalid={
                                        hasInvalidPriceRange
                                    }
                                />

                                <input
                                    type="number"
                                    min="0"
                                    value={maxPrice}
                                    onChange={(event) =>
                                        setMaxPrice(event.target.value)
                                    }
                                    placeholder="Max"
                                    aria-label="Maximum price"
                                    aria-invalid={
                                        hasInvalidPriceRange
                                    }
                                />
                            </div>

                            {hasInvalidPriceRange && (
                                <p
                                    className="search-filter-error"
                                    role="alert"
                                >
                                    Minimum price cannot be greater than
                                    maximum price.
                                </p>
                            )}
                        </div>

                        <div className="search-filter-group">
                            <label htmlFor="search-rating">
                                Minimum Rating
                            </label>

                            <select
                                id="search-rating"
                                value={minRating}
                                onChange={(event) =>
                                    setMinRating(event.target.value)
                                }
                            >
                                <option value="">
                                    Any rating
                                </option>

                                <option value="4">
                                    4+ stars
                                </option>

                                <option value="3">
                                    3+ stars
                                </option>

                                <option value="2">
                                    2+ stars
                                </option>

                                <option value="1">
                                    1+ star
                                </option>
                            </select>
                        </div>

                        <label className="stock-filter">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(event) =>
                                    setInStock(event.target.checked)
                                }
                            />

                            <span>In stock only</span>
                        </label>
                    </aside>

                    <section
                        className="search-results"
                        aria-label="Search results"
                    >
                        <div className="search-toolbar">
                            <span>
                                {isLoadingMore
                                    ? "Loading more..."
                                    : `${products.length} results loaded`}
                            </span>

                            <label>
                                <span className="sr-only">
                                    Sort products
                                </span>

                                <select
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(event.target.value)
                                    }
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {isInitialLoading && (
                            <div
                                className="search-status"
                                role="status"
                                aria-live="polite"
                            >
                                Loading products...
                            </div>
                        )}

                        {hasInvalidPriceRange && (
                            <div
                                className="search-status"
                                role="alert"
                            >
                                <h2>Invalid price range</h2>

                                <p>
                                    Please enter a minimum price that is
                                    less than or equal to the maximum price.
                                </p>
                            </div>
                        )}

                        {isError &&
                            !hasInvalidPriceRange &&
                            products.length === 0 && (
                                <div
                                    className="search-status search-error"
                                    role="alert"
                                >
                                    <h2>
                                        Unable to load products
                                    </h2>

                                    <p>
                                        Something went wrong while loading
                                        search results.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => refetch()}
                                        disabled={isFetching}
                                    >
                                        {isFetching
                                            ? "Retrying..."
                                            : "Try again"}
                                    </button>

                                    {error && (
                                        <span className="sr-only">
                                            Search request failed.
                                        </span>
                                    )}
                                </div>
                            )}

                        {showEmptyState && (
                            <div
                                className="search-status"
                                role="status"
                            >
                                <h2>No products found</h2>

                                <p>
                                    Try changing your search or filters.
                                </p>
                            </div>
                        )}

                        {products.length > 0 && (
                            <>
                                <div className="search-product-grid">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                        />
                                    ))}
                                </div>

                                <div
                                    ref={loadMoreRef}
                                    className="search-load-more"
                                    aria-live="polite"
                                >
                                    {isLoadingMore && (
                                        <span>
                                            Loading more products...
                                        </span>
                                    )}

                                    {!isFetching && hasMore && (
                                        <span>
                                            Scroll to load more
                                        </span>
                                    )}

                                    {!isFetching && !hasMore && (
                                        <span>
                                            You&apos;ve reached the end.
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
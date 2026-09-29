
"use client";

import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;

  minPrice: number | null;
  maxPrice: number | null;

  categories: string[];

  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;

  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;

  onClearFilters: () => void;
}

export default function ProductFilters({
  searchTerm,
  selectedCategory,
  sortBy,
  minPrice,
  maxPrice,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: ProductFiltersProps) {
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedCategory !== "all" ||
    sortBy !== "default" ||
    minPrice !== null ||
    maxPrice !== null;

  const hasInvalidPriceRange =
    minPrice !== null &&
    maxPrice !== null &&
    minPrice > maxPrice;

  const handleMinPriceChange = (
    value: string
  ) => {
    if (value === "") {
      onMinPriceChange(null);
      return;
    }

    const parsedValue = Number(value);

    if (
      Number.isFinite(parsedValue) &&
      parsedValue >= 0
    ) {
      onMinPriceChange(parsedValue);
    }
  };

  const handleMaxPriceChange = (
    value: string
  ) => {
    if (value === "") {
      onMaxPriceChange(null);
      return;
    }

    const parsedValue = Number(value);

    if (
      Number.isFinite(parsedValue) &&
      parsedValue >= 0
    ) {
      onMaxPriceChange(parsedValue);
    }
  };

  return (
    <section
      className="product-filters"
      aria-label="Product filters"
    >
      <div className="product-search-wrapper">
        <Search
          size={19}
          aria-hidden="true"
        />

        <label
          htmlFor="product-search"
          className="sr-only"
        >
          Search products
        </label>

        <input
          id="product-search"
          type="search"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search products..."
          className="product-search-input"
          autoComplete="off"
        />
      </div>

      <div className="product-filter-controls">
        {/* Price */}
        <div className="product-filter-group product-price-filter">
          <span className="product-filter-label">
            Price Range
          </span>

          <div className="price-inputs">
            <label
              htmlFor="product-min-price"
              className="sr-only"
            >
              Minimum price
            </label>

            <input
              id="product-min-price"
              type="number"
              min="0"
              step="0.01"
              value={minPrice ?? ""}
              onChange={(event) =>
                handleMinPriceChange(
                  event.target.value
                )
              }
              placeholder="Min"
              aria-label="Minimum price"
              aria-invalid={hasInvalidPriceRange}
            />

            <span aria-hidden="true">-</span>

            <label
              htmlFor="product-max-price"
              className="sr-only"
            >
              Maximum price
            </label>

            <input
              id="product-max-price"
              type="number"
              min="0"
              step="0.01"
              value={maxPrice ?? ""}
              onChange={(event) =>
                handleMaxPriceChange(
                  event.target.value
                )
              }
              placeholder="Max"
              aria-label="Maximum price"
              aria-invalid={hasInvalidPriceRange}
            />
          </div>

          {hasInvalidPriceRange && (
            <p
              className="product-filter-error"
              role="alert"
            >
              Minimum price cannot be greater than
              maximum price.
            </p>
          )}
        </div>

        {/* Category */}
        <div className="product-filter-group">
          <label
            htmlFor="category-filter"
            className="product-filter-label"
          >
            <Filter
              size={16}
              aria-hidden="true"
            />
            Category
          </label>

          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) =>
              onCategoryChange(
                event.target.value
              )
            }
            className="product-filter-select"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="product-filter-group">
          <label
            htmlFor="sort-filter"
            className="product-filter-label"
          >
            <SlidersHorizontal
              size={16}
              aria-hidden="true"
            />
            Sort By
          </label>

          <select
            id="sort-filter"
            value={sortBy}
            onChange={(event) =>
              onSortChange(
                event.target.value
              )
            }
            className="product-filter-select"
          >
            <option value="default">
              Recommended
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating-high">
              Rating: High to Low
            </option>

            <option value="name-asc">
              Name: A to Z
            </option>

            <option value="name-desc">
              Name: Z to A
            </option>
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-product-filters"
            onClick={onClearFilters}
            aria-label="Clear all product filters"
          >
            <X
              size={16}
              aria-hidden="true"
            />

            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </section>
  );
}
  

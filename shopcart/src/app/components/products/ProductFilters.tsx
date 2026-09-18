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

  return (
    <section className="product-filters">
      <div className="product-search-wrapper">
        <Search size={19} />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search products..."
          aria-label="Search products"
          className="product-search-input"
        />
      </div>

      <div className="product-filter-controls">
        <div className="product-filter-group product-price-filter">
  <label>
    Price Range
  </label>

  <div className="price-inputs">
    <input
      type="number"
      min="0"
      value={minPrice ?? ""}
      onChange={(event) => {
        const value = event.target.value;

        onMinPriceChange(
          value === "" ? null : Number(value)
        );
      }}
      placeholder="Min"
      aria-label="Minimum price"
    />

    <span>-</span>

    <input
      type="number"
      min="0"
      value={maxPrice ?? ""}
      onChange={(event) => {
        const value = event.target.value;

        onMaxPriceChange(
          value === "" ? null : Number(value)
        );
      }}
      placeholder="Max"
      aria-label="Maximum price"
    />
  </div>
</div>
        <div className="product-filter-group">
          <label htmlFor="category-filter">
            <Filter size={16} />
            Category
          </label>

          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) =>
              onCategoryChange(event.target.value)
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

        <div className="product-filter-group">
          <label htmlFor="sort-filter">
            <SlidersHorizontal size={16} />
            Sort By
          </label>

          <select
            id="sort-filter"
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value)
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

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-product-filters"
            onClick={onClearFilters}
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </section>
  );
}
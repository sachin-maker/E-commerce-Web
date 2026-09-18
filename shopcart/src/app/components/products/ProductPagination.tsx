"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <nav
      className="product-pagination"
      aria-label="Product pagination"
    >
      <button
        type="button"
        className="pagination-button pagination-arrow"
        onClick={() =>
          onPageChange(currentPage - 1)
        }
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="pagination-page-list">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className={`pagination-button ${
              currentPage === page
                ? "active"
                : ""
            }`}
            onClick={() => onPageChange(page)}
            aria-current={
              currentPage === page
                ? "page"
                : undefined
            }
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pagination-button pagination-arrow"
        onClick={() =>
          onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
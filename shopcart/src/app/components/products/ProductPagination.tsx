
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

const MAX_VISIBLE_PAGES = 5;

export default function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const goToPage = (page: number) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage
    ) {
      return;
    }

    onPageChange(page);
  };

  const getPageNumbers = (): (
    | number
    | "ellipsis-left"
    | "ellipsis-right"
  )[] => {
    /*
     * For a small number of pages, show everything.
     */
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    /*
     * Near the beginning:
     *
     * 1 2 3 4 5 ... 20
     */
    if (safeCurrentPage <= 3) {
      return [
        1,
        2,
        3,
        4,
        5,
        "ellipsis-right",
        totalPages,
      ];
    }

    /*
     * Near the end:
     *
     * 1 ... 16 17 18 19 20
     */
    if (safeCurrentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    /*
     * Middle:
     *
     * 1 ... 8 9 10 ... 20
     */
    return [
      1,
      "ellipsis-left",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="product-pagination"
      aria-label="Product pagination"
    >
      {/* Previous */}
      <button
        type="button"
        className="pagination-button pagination-arrow"
        onClick={() =>
          goToPage(safeCurrentPage - 1)
        }
        disabled={safeCurrentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft
          size={18}
          aria-hidden="true"
        />
      </button>

      <div className="pagination-page-list">
        {pages.map((page, index) => {
          if (
            page === "ellipsis-left" ||
            page === "ellipsis-right"
          ) {
            return (
              <span
                key={`${page}-${index}`}
                className="pagination-ellipsis"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrent =
            safeCurrentPage === page;

          return (
            <button
              type="button"
              key={page}
              className={`pagination-button ${
                isCurrent ? "active" : ""
              }`}
              onClick={() => goToPage(page)}
              disabled={isCurrent}
              aria-current={
                isCurrent ? "page" : undefined
              }
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        className="pagination-button pagination-arrow"
        onClick={() =>
          goToPage(safeCurrentPage + 1)
        }
        disabled={
          safeCurrentPage === totalPages
        }
        aria-label="Next page"
      >
        <ChevronRight
          size={18}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}



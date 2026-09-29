
"use client";

import { Star } from "lucide-react";

import type { ProductReview } from "@/app/types/product";

interface ProductReviewsProps {
  reviews?: ProductReview[];
  rating: number;
}

function formatReviewDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProductReviews({
  reviews = [],
  rating,
}: ProductReviewsProps) {
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (ratingValue) => ({
      rating: ratingValue,
      count: 0,
    })
  );

  for (const review of reviews) {
    const roundedRating = Math.round(review.rating);

    const ratingItem = ratingCounts.find(
      (item) => item.rating === roundedRating
    );

    if (ratingItem) {
      ratingItem.count += 1;
    }
  }

  const averageReviewRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : rating;

  const safeAverageRating = Math.min(
    5,
    Math.max(0, averageReviewRating)
  );

  if (reviews.length === 0) {
    return (
      <section
        className="product-reviews-section"
        aria-labelledby="product-reviews-title"
      >
        <span className="section-eyebrow">
          Customer Reviews
        </span>

        <h2
          id="product-reviews-title"
          className="product-reviews-title"
        >
          Reviews
        </h2>

        <p>
          No reviews available for this product.
        </p>
      </section>
    );
  }

  return (
    <section
      className="product-reviews-section"
      aria-labelledby="product-reviews-title"
    >
      <div className="product-reviews-header">
        <div>
          <span className="section-eyebrow">
            Customer Reviews
          </span>

          <h2
            id="product-reviews-title"
            className="product-reviews-title"
          >
            What customers say
          </h2>

          <p className="product-reviews-subtitle">
            Real feedback from customers who
            purchased this product.
          </p>
        </div>

        <div
          className="product-average-rating"
          aria-label={`Average rating ${safeAverageRating.toFixed(
            1
          )} out of 5`}
          role="img"
        >
          <Star
            size={20}
            fill="currentColor"
            aria-hidden="true"
          />

          <strong>
            {safeAverageRating.toFixed(1)}
          </strong>

          <span>
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </span>
        </div>
      </div>

      <div className="product-rating-breakdown">
        {ratingCounts.map((item) => {
          const percentage =
            (item.count / reviews.length) * 100;

          return (
            <div
              key={item.rating}
              className="product-rating-row"
            >
              <span className="product-rating-label">
                {item.rating}{" "}
                <Star
                  size={14}
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>

              <div
                className="product-rating-bar"
                role="progressbar"
                aria-label={`${item.rating} star reviews`}
                aria-valuenow={item.count}
                aria-valuemin={0}
                aria-valuemax={reviews.length}
              >
                <div
                  className="product-rating-bar-fill"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <span className="product-rating-count">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="product-reviews-list">
        {reviews.map((review, index) => {
          const safeReviewRating = Math.min(
            5,
            Math.max(0, review.rating)
          );

          return (
            <article
              key={`${review.reviewerEmail}-${review.date}-${index}`}
              className="product-review-card"
            >
              <div className="product-review-header">
                <strong>
                  {review.reviewerName}
                </strong>

                <time
                  dateTime={review.date}
                >
                  {formatReviewDate(review.date)}
                </time>
              </div>

              <div
                className="product-review-rating"
                aria-label={`Rated ${safeReviewRating} out of 5`}
                role="img"
              >
                {Array.from(
                  { length: 5 },
                  (_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={16}
                      fill={
                        starIndex <
                        Math.round(safeReviewRating)
                          ? "currentColor"
                          : "none"
                      }
                      aria-hidden="true"
                    />
                  )
                )}
              </div>

              <p className="product-review-comment">
                {review.comment}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}



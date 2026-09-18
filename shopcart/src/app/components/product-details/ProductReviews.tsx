"use client";

import { Star } from "lucide-react";
import type { ProductReview } from "@/app/types/product";

interface ProductReviewsProps {
    reviews?: ProductReview[];
    rating: number;
}

export default function ProductReviews({
    reviews = [],
    rating,
}: ProductReviewsProps) {
    const ratingCounts = [5, 4, 3, 2, 1].map(
        (ratingValue) => ({
            rating: ratingValue,
            count: reviews.filter(
                (review) => Math.floor(review.rating) === ratingValue
            ).length,
        })
    );
    const averageReviewRating =
        reviews.length > 0
            ? reviews.reduce(
                (sum, review) => sum + review.rating,
                0
            ) / reviews.length
            : rating;

    if (reviews.length === 0) {
        return (
            <section className="product-reviews-section">
                <span className="section-eyebrow">
                    Customer Reviews
                </span>

                <h2 className="product-reviews-title">
                    Reviews
                </h2>

                <p>No reviews available for this product.</p>
            </section>
        );
    }

    return (
        <section className="product-reviews-section">
            <div className="product-reviews-header">
                <div>
                    <span className="section-eyebrow">
                        Customer Reviews
                    </span>

                    <h2 className="product-reviews-title">
                        What customers say
                    </h2>

                    <p className="product-reviews-subtitle">
                        Real feedback from customers who purchased this product.
                    </p>
                </div>

                <div
                    className="product-average-rating"
                    aria-label={`Average rating ${averageReviewRating.toFixed(1)} out of 5`}
                    role="img"
                >
                    <Star
                        size={20}
                        fill="currentColor"
                        aria-hidden="true"
                    />


                    <strong>{averageReviewRating.toFixed(1)}</strong>


                    <span>
                        {reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                </div>
            </div>

            <div className="product-rating-breakdown">
                {ratingCounts.map((item) => {
                    const percentage =
                        reviews.length > 0
                            ? (item.count / reviews.length) * 100
                            : 0;

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
                {reviews.map((review, index) => (
                    <article
                        key={`${review.reviewerEmail}-${index}`}
                        className="product-review-card"
                    >
                        <div className="product-review-header">
                            <strong>
                                {review.reviewerName}
                            </strong>

                            <span>
                                {new Date(
                                    review.date
                                ).toLocaleDateString()}
                            </span>
                        </div>

                        <div
                            className="product-review-rating"
                            aria-label={`Rated ${review.rating} out of 5`}
                            role="img"
                        >
                            {Array.from(
                                { length: 5 },
                                (_, starIndex) => (
                                    <Star
                                        key={starIndex}
                                        size={16}
                                        fill={
                                            starIndex < review.rating
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
                ))}
            </div>
        </section>
    );
}
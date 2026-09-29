import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Truck,
} from "lucide-react";

import "./PromotionalBanners.css";

export default function PromotionalBanners() {
  return (
    <section
      className="promotions-section"
      aria-labelledby="promotions-title"
    >
      <div className="home-container">
        <h2
          id="promotions-title"
          className="sr-only"
        >
          ShopCart Offers
        </h2>

        <div className="promotions-grid">
          <div className="promotion-card promotion-blue">
            <div className="promotion-content">
              <span className="promotion-label">
                Limited Time Offer
              </span>

              <h3>
                Get up to
                <br />
                <strong>30% OFF</strong>
              </h3>

              <p>
                Save more on selected products
                while the offer lasts.
              </p>

              <Link
                href="/products"
                className="promotion-button"
                aria-label="Shop products with current deals"
              >
                Shop Deals

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className="promotion-visual"
              aria-hidden="true"
            >
              <Gift
                size={100}
                strokeWidth={1}
              />

              <span className="promotion-sparkle">
                ✦
              </span>
            </div>
          </div>

          <div className="promotion-card promotion-dark">
            <div className="promotion-content">
              <span className="promotion-label">
                Shopping made easy
              </span>

              <h3>
                Free Shipping
                <br />
                <strong>On orders ₹999+</strong>
              </h3>

              <p>
                Get your favorite products delivered
                right to your doorstep.
              </p>

              <Link
                href="/products"
                className="promotion-button"
                aria-label="Start shopping at ShopCart"
              >
                Start Shopping

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className="promotion-visual"
              aria-hidden="true"
            >
              <Truck
                size={100}
                strokeWidth={1}
              />

              <span className="promotion-sparkle">
                ✦
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

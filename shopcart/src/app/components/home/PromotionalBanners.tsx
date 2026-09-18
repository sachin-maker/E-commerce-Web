
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Truck,
} from "lucide-react";

import "./PromotionalBanners.css";

export default function PromotionalBanners() {
  return (
    <section className="promotions-section">
      <div className="home-container">
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
                On selected products. Shop now and
                save more.
              </p>

              <Link
                href="/products?sort=deals"
                className="promotion-button"
              >
                Shop Deals
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="promotion-visual">
              <Gift size={100} strokeWidth={1} />
              <span className="promotion-sparkle">✦</span>
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
                Get your favorites delivered right
                to your doorstep.
              </p>

              <Link
                href="/products"
                className="promotion-button"
              >
                Start Shopping
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="promotion-visual">
              <Truck size={100} strokeWidth={1} />
              <span className="promotion-sparkle">✦</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
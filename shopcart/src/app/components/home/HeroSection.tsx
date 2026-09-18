
import Link from "next/link";

import "./HeroSection.css";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="home-container hero-container">
        <div className="hero-content">
          <span className="hero-eyebrow">
            ✨ Discover your next favorite
          </span>

          <h1 className="hero-title">
            Shop smarter.
            <br />
            <span>Live better.</span>
          </h1>

          <p className="hero-description">
            Discover amazing products, unbeatable deals,
            and everything you need — all in one place.
          </p>

          <div className="hero-buttons">
            <Link
              href="/products"
              className="hero-primary-button"
            >
              Shop Now
              <span>→</span>
            </Link>

            <Link
              href="/products?sort=featured"
              className="hero-secondary-button"
            >
              Explore Collection
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <strong>10K+</strong>
              <span>Products</span>
            </div>

            <div className="hero-trust-item">
              <strong>4.8/5</strong>
              <span>Customer Rating</span>
            </div>

            <div className="hero-trust-item">
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle hero-circle-one" />
          <div className="hero-circle hero-circle-two" />

          <div className="hero-shopping-bag">
            <span className="hero-bag-handle" />
            <div className="hero-bag-body">
              <span className="hero-bag-logo">
                S
              </span>
              <span className="hero-bag-text">
                ShopCart
              </span>
            </div>
          </div>

          <div className="hero-floating-card hero-card-top">
            <span className="hero-floating-icon">🛍️</span>
            <div>
              <strong>New Arrivals</strong>
              <small>Explore latest trends</small>
            </div>
          </div>

          <div className="hero-floating-card hero-card-bottom">
            <span className="hero-floating-icon">🎉</span>
            <div>
              <strong>Special Offers</strong>
              <small>Save more, shop more</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
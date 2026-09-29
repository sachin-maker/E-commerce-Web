
import Link from "next/link";


import "./Footer.css";
import { CalendarHeart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="home-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="footer-logo-icon">
                S
              </span>

              <span>
                Shop<span>Cart</span>
              </span>
            </Link>

            <p>
              Your one-stop destination for quality
              products, great deals, and an amazing
              shopping experience.
            </p>

            <div className="footer-socials">
              <a
                href="#"
                aria-label="Facebook"
              >
                <CalendarHeart size={17} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
              >
                <CalendarHeart size={17} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
              >
                <CalendarHeart size={17} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Shop</h3>

            <Link href="/products">
              All Products
            </Link>

            <Link href="/products?sort=featured">
              Featured
            </Link>

            <Link href="/products?sort=deals">
              Deals
            </Link>

            <Link href="/products?sort=new">
              New Arrivals
            </Link>
          </div>

          <div className="footer-column">
            <h3>Account</h3>

            <Link href="/login">Login</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/cart">Shopping Cart</Link>
            <Link href="/orders">Track Order</Link>
          </div>

          <div className="footer-column">
            <h3>Help</h3>

            <Link href="/help">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/shipping">Shipping Info</Link>
            <Link href="/returns">Returns</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} ShopCart.
            All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link href="/privacy">
              Privacy Policy
            </Link>

            <Link href="/terms">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

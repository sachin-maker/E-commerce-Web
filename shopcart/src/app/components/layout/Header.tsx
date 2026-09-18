
"use client";
import { useAppSelector } from "@/app/store/hooks";
import { useState } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { useAppDispatch } from "@/app/store/hooks";

import { logout } from "@/app/store/slices/authSlice";

import "./Header.css";

const categories = [
  { name: "Beauty", slug: "beauty" },
  { name: "Fragrances", slug: "fragrances" },
  { name: "Furniture", slug: "furniture" },
  { name: "Groceries", slug: "groceries" },
  { name: "Laptops", slug: "laptops" },
  { name: "Mens Shirts", slug: "mens-shirts" },
  { name: "Mens Shoes", slug: "mens-shoes" },
  { name: "Mobile Accessories", slug: "mobile-accessories" },
  { name: "Motorcycle", slug: "motorcycle" },
  { name: "Skin Care", slug: "skin-care" },
  { name: "Smartphones", slug: "smartphones" },
  { name: "Sports Accessories", slug: "sports-accessories" },
  { name: "Sunglasses", slug: "sunglasses" },
  { name: "Tablets", slug: "tablets" },
  { name: "Tops", slug: "tops" },
  { name: "Vehicle", slug: "vehicle" },
  { name: "Womens Bags", slug: "womens-bags" },
  { name: "Womens Dresses", slug: "womens-dresses" },
  { name: "Womens Jewellery", slug: "womens-jewellery" },
  { name: "Womens Shoes", slug: "womens-shoes" },
];

export default function Header() {
  const router = useRouter();
const dispatch = useAppDispatch();

const { user, isAuthenticated } = useAppSelector(
  (state) => state.auth
);

const isAdmin = user?.role === "admin";


  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isCategoryOpen, setIsCategoryOpen] =
    useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const wishlistItemCount = wishlistItems.length;
  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
  dispatch(logout());

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/");
};

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) return;

    window.location.href = `/products?search=${encodeURIComponent(
      trimmedSearch
    )}`;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCategoryOpen(false);
  };


  return (
    <header className="site-header">
      {/* Top announcement bar */}
      <div className="announcement-bar">
        <div className="header-container announcement-content">
          <p>Free shipping on orders over ₹999</p>

          <div className="announcement-links">
            <Link href="/orders">
              Track Order
            </Link>

            <span className="announcement-divider">
              |
            </span>

            <Link href="/help">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="header-main">
        <div className="header-container header-main-inner">
          {/* Logo */}
          <Link
            href="/"
            className="brand-logo"
            onClick={closeMobileMenu}
          >
            <span className="brand-logo-icon">
              S
            </span>

            <span className="brand-logo-text">
              Shop<span>Cart</span>
            </span>
          </Link>

          {/* Search */}
          <form
            className="header-search"
            onSubmit={handleSearch}
          >
            <Search
              size={20}
              className="search-icon"
              aria-hidden="true"
            />

            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <button
              type="submit"
              className="search-button"
              aria-label="Submit search"
            >
              Search
            </button>
          </form>

          {/* Desktop actions */}
          <div className="header-actions">
            <Link
              href="/wishlist"
              className="header-action"
              aria-label="Wishlist"
            >
              <span className="header-action-icon">
                <Heart size={23} />
                <span className="action-badge">
                  {wishlistItemCount}
                </span>
              </span>

              <span className="header-action-text">
                <small>My</small>
                <strong>Wishlist</strong>
              </span>
            </Link>
            <Link
              href="/orders"

            >
              <Package size={20} />
              Orders
            </Link>

            {isAuthenticated ? (
  <div className="header-action account-section">
    <UserRound size={23} />

    <span className="header-action-text">
      <small>Hello, {user?.name}</small>
      <strong>Account</strong>
    </span>

    {isAdmin && (
      <Link
        href="/admin"
        className="admin-link"
        aria-label="Admin dashboard"
      >
        <ShieldCheck size={18} />
        Admin
      </Link>
    )}

    <button
      type="button"
      onClick={handleLogout}
      className="logout-button"
      aria-label="Logout"
    >
      <LogOut size={18} />
      Logout
    </button>
  </div>
) : (
  <Link
    href="/login"
    className="header-action"
    aria-label="Login or account"
  >
    <UserRound size={23} />

    <span className="header-action-text">
      <small>Hello, Sign in</small>
      <strong>Account</strong>
    </span>
  </Link>
)}

            <Link
              href="/cart"
              className="header-action"
              aria-label="Shopping cart"
            >
              <span className="header-action-icon">
                <ShoppingCart size={24} />
                <span className="action-badge">
                  {cartItemCount}
                </span>
              </span>

              <span className="header-action-text">
                <small>My</small>
                <strong>Cart</strong>
              </span>
            </Link>

          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() => {
              setIsMobileMenuOpen(
                !isMobileMenuOpen
              );
            }}
          >
            {isMobileMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="desktop-navbar">
        <div className="header-container navbar-inner">
          <div className="category-menu-wrapper">
            <button
              type="button"
              className="category-menu-button"
              onClick={() =>
                setIsCategoryOpen(!isCategoryOpen)
              }
              aria-expanded={isCategoryOpen}
              aria-haspopup="true"
            >
              <Menu size={20} />
              <span>All Categories</span>
              <ChevronDown
                size={17}
                className={
                  isCategoryOpen
                    ? "chevron-rotate"
                    : ""
                }
              />
            </button>

            {isCategoryOpen && (
              <div className="category-dropdown">
                <div className="category-dropdown-title">
                  <h3>Shop by Category</h3>
                </div>

                <div className="category-grid">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products/category/${category.slug}`}
                      onClick={() =>
                        setIsCategoryOpen(false)
                      }
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="main-nav-links">
            <Link
              href="/"
              className={
                isActive("/")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Home
            </Link>

            <Link
              href="/products"
              className={
                isActive("/products")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Shop
            </Link>

            <Link
              href="/products?sort=featured"
              className="nav-link"
            >
              Featured
            </Link>

            <Link
              href="/products?sort=deals"
              className="nav-link"
            >
              Deals
            </Link>

            <Link
              href="/products?sort=new"
              className="nav-link"
            >
              New Arrivals
            </Link>
          </div>

          <div className="navbar-right">
            <span className="navbar-delivery">
              <span className="delivery-dot" />
              Fast Delivery
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div
        className={
          isMobileMenuOpen
            ? "mobile-menu open"
            : "mobile-menu"
        }
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <h2>Menu</h2>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobileMenu}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="mobile-nav-links">
            <Link
              href="/"
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
            >
              Shop All Products
            </Link>

            <Link
              href="/products?sort=featured"
              onClick={closeMobileMenu}
            >
              Featured
            </Link>

            <Link
              href="/products?sort=deals"
              onClick={closeMobileMenu}
            >
              Deals
            </Link>

            <Link
              href="/products?sort=new"
              onClick={closeMobileMenu}
            >
              New Arrivals
            </Link>

          </nav>

          <div className="mobile-menu-section">
            <button
              type="button"
              className="mobile-category-toggle"
              onClick={() =>
                setIsCategoryOpen(!isCategoryOpen)
              }
              aria-expanded={isCategoryOpen}
            >
              <span>Categories</span>
              <ChevronDown
                size={18}
                className={
                  isCategoryOpen
                    ? "chevron-rotate"
                    : ""
                }
              />
            </button>

            {isCategoryOpen && (
              <div className="mobile-category-list">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products/category/${category.slug}`}
                    onClick={closeMobileMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-action-links">
            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
            >
              <Heart size={20} />
              Wishlist
              <span>{wishlistItemCount}</span>
            </Link>



            <Link
              href="/cart"
              onClick={closeMobileMenu}
            >
              <ShoppingCart size={20} />
              Cart
              <span>{cartItemCount}</span>
            </Link>

            {isAuthenticated ? (
  <>
    <div className="mobile-user-info">
      <UserRound size={20} />

      <div>
        <strong>{user?.name}</strong>
        <small>{user?.email}</small>
      </div>
    </div>

    {isAdmin && (
      <Link
        href="/admin"
        onClick={closeMobileMenu}
      >
        <ShieldCheck size={20} />
        Admin Dashboard
      </Link>
    )}

    <button
      type="button"
      onClick={() => {
        handleLogout();
        closeMobileMenu();
      }}
      className="mobile-logout-button"
    >
      <LogOut size={20} />
      Logout
    </button>
  </>
) : (
  <Link
    href="/login"
    onClick={closeMobileMenu}
  >
    <UserRound size={20} />
    Login / Account
  </Link>
)}

            <Link
              href="/orders"
              onClick={closeMobileMenu}
            >
              <Package size={20} />
              <span>Orders</span>
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}